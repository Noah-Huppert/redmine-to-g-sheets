"use strict";

var RECURSION_MAX_DEFAULT = 20;

/**
 * Attempts to deep copy an object
 * @param obj Object to copy
 * @param recursionCounter How deep recursion has gone
 * @param recursionMax Max recursion depth
 * @returns {{}} Deep copy of obj
 */
function deepCopy(obj, recursionMax, recursionCounter) {
  // Recursion
  if (recursionCounter === undefined) {
    recursionCounter = 0;
  } else {
    recursionCounter++;
  }

  if (recursionMax === undefined) {
    recursionMax = RECURSION_MAX_DEFAULT;
  } else if (recursionCounter > recursionMax) {
    throw new Error("Reached max recursion depth: " + recursionMax);
  }

  // Copy
  var newCopy = {};

  // For each key
  for (var key in obj) {
    // If object
    if (typeof obj[key] === "object" && Object.getOwnPropertyNames(obj[key]).length > ((obj[key].length !== undefined) ? 1 : 0)) {
      // Recursion
      newCopy[key] = deepCopy(obj[key], recursionMax, recursionCounter);
    } else {// If regular value
      // Copy normally
      newCopy[key] = obj[key];
    }
  }

  // Return copy
  return newCopy;
}

// Issue Class
/**
 * Class which represents Redmine issue loaded in from spreadsheet.
 * @param id Id
 * @param type Type, either bug or task
 * @param parentId Parent Id or undefined if parent
 * @param status Current status of issue
 * @param priority How important issue is
 * @param subject Short summary of issue
 * @param assignee Team member assigned to issue
 * @param updated Last Date issue was updatedd
 * @param startDate Task start date
 * @param dueDate Task due date
 * @param estimatedTime Estimated issue completion time
 * @param percentDone Issue Completion
 * @param created Date Issue was created
 * @param closed If issue is closed
 * @param rawRelatedIssues Text describing related Issues
 * @returns {Issue}
 * @constructor
 */
function Issue(id,
               type,
               parentId,
               status,
               priority,
               subject,
               assignee,
               updated,
               startDate,
               dueDate,
               estimatedTime,
               percentDone,
               created,
               closed,
               rawRelatedIssues) {

  // Constructor
  this.id = id;
  this.type = type;
  this.parentId = parentId.substr(1);// Remove "#" from beginning of string
  this.status = status;
  this.priority = priority;
  this.subject = subject;
  this.assignee = assignee;
  this.updated = updated;
  this.startDate = startDate;
  this.dueDate = dueDate;
  this.estimatedTime = estimatedTime;
  this.percentDone = percentDone;
  this.created = created;
  this.closed = closed;
  this.rawRelatedIssues = rawRelatedIssues;// Maybe parse for relationships at a future time

  this.children = [];

  /**
   * Determines if Issue has parent issue
   * @returns {boolean}
   */
  this.hasParent = function () {
    return this.parentId !== undefined && this.parentId.length > 0;
  };

  /**
   * Convert Issue into Row Array to be returned from spreadsheet function
   * @returns {Array}
   */
  this.toRowArray = function () {
    return [
      [
        "#",
        "Parent #",
        "Type",
        "Priority",
        "Status",
        "Subject",
        "Assignee",
        "Start date",
        "Due date",
        "Estimated time",
        "Percent done"
      ],
      [
        this.id,
        this.parentId,
        this.type,
        this.priority,
        this.status,
        this.subject,
        this.assignee,
        this.startDate,
        this.dueDate,
        this.estimatedTime,
        this.percentDone
      ]
    ];
  };

  return this;
}

// Source Issues Sheet Columns
Issue.COLUMNS = {
  id: 0,
  type: 2,
  parentId: 3,
  status: 4,
  priority: 5,
  subject: 6,
  assignee: 8,
  updated: 9,
  startDate: 12,
  dueDate: 13,
  estimatedTime: 14,
  percentDone: 15,
  created: 16,
  closed: 17,
  relatedIssues: 18
};

// Priority column values
Issue.PRIORITY_SORT_VALUES = {
  "Low": 0,
  "Normal": 1,
  "High": 2,
  "Urgent": 3,
  "Immediate": 4
};

// factories
/**
 * Creates a Task from a Source Issues Sheet row
 * @param row Row to make Task
 * @returns Issue
 */
Issue.fromRow = function (row) {
  var args = [];

  for (var key in Issue.COLUMNS) {
    var col = Issue.COLUMNS[key];
    args.push(row[col]);
  }

  return new Issue(args[0],
    args[1],
    args[2],
    args[3],
    args[4],
    args[5],
    args[6],
    args[7],
    args[8],
    args[9],
    args[10],
    args[11],
    args[12],
    args[13],
    args[14]
  );
};

/**
 * Returns array of Issues from Source Issues Sheet rows
 * @param rows Rows of Issues
 * @returns {Issue} Map of Issues
 */
Issue.fromRows = function (rows) {
  var issues = {};

  for (var i = 0; i < rows.length; i++) {
    var issue = Issue.fromRow(rows[i]);
    // Check that we aren't reading a column header row
    if (issue.id !== "#") {
      issues[issue.id] = deepCopy(issue);
    }
  }

  return issues;
};

// compare
/**
 * Compares two issues based on their start date, if their start dates are equal then compares via due date. If both
 * dates are equal priority is used.
 * @param a First issue
 * @param b Second issue
 * @returns -1 if a is less than b, 1 is a is greater than b, 0 if equal
 */
Issue.compareIssues = function (a, b) {
  // First compare by start date
  if (a.startDate < b.startDate) {
    return -1;
  } else if (a.startDate > b.startDate) {
    return 1;
  }

  // If start dates are equal compare by due date
  if (a.dueDate < b.dueDate) {
    return -1;
  } else if (a.dueDate > b.dueDate) {
    return 1;
  }

  // If dates are equal use priority
  var aP = Issue.PRIORITY_SORT_VALUES[a.priority];
  var bP = Issue.PRIORITY_SORT_VALUES[b.priority];

  if (aP < bP) {
    return -1;
  } else if (aP > bP) {
    return 1;
  }


  // If both dates and priority are equal
  return 0;
};

// IssueTree Class
/**
 * Class which stores Issue class tree, used to represent parent and child tasks.
 * Simplified to deal with only Redmine issues 1 level deep.
 *
 * Consider immutable because sorting and parent issue mapping only occurs in constructor.
 * @param issues Issues map to construct tree out of
 * @returns {IssueTree}
 * @constructor
 */
function IssueTree(issues) {
  this.issues = issues;
  this.parentIssues = {};

  // Place issues and subissues
  // For each issue
  for (var id in this.issues) {
    var issue = this.issues[id];

    // If is parent and no parent issue placeholder
    if (issue.hasParent() === false && (issue.id in this.parentIssues) === false) {
      this.parentIssues[issue.id] = {
        issue: issue,
        children: {}
      };
    } else if (issue.hasParent() === false && (issue.id in this.parentIssues) === true) {// If is parent and parent issue placeholder exists
      this.parentIssues[issue.id].issue = issue;
    } else if (issue.hasParent() === true && (issue.parentId in this.parentIssues) === true) {// If has parent and parent exists
      this.parentIssues[issue.parentId].children[issue.id] = issue;
    } else if (issue.hasParent() === true && (issue.parentId in this.parentIssues) === false) {// If has parent and parent doesn't exist yet
      var childrenMap = {};
      childrenMap[issue.id] = issue;

      this.parentIssues[issue.parentId] = {
        issue: undefined,
        children: childrenMap
      };
    }

    issue = undefined;
  }

  // Sort parent issues
  this.sortedParentIssues = [];

  // For each parent issue
  for (var pId in this.parentIssues) {
    var parent = deepCopy(this.parentIssues[pId].issue);

    // Sort children
    for (var cId in this.parentIssues[pId].children) {
      var child = this.parentIssues[pId].children[cId];

      parent.children.push(child);
    }
    parent.children.sort(Issue.compareIssues);

    this.sortedParentIssues.push(parent);
  }

  this.sortedParentIssues.sort(Issue.compareIssues);

  // Row map for styling later usage
  this.issueToRowMap = {};

  // For each parent issue
  var row = 2;// Start on 2 b/c row 1 is column headers
  for (var pI = 0; pI < this.sortedParentIssues.length; pI++) {
    var parent = this.sortedParentIssues[pI];
    this.issueToRowMap[parent.id] = row;

    // For each child issue
    for (var cI = 0; cI < parent.children.length; cI++) {
      row++;
      var child = parent.children[cI];
      this.issueToRowMap[child.id] = row;
    }

    row++;
  }

  /**
   * Convert IssueTree into Row Array to be returned from spreadsheet function
   * @returns {Array}
   */
  this.toRowArray = function () {
    var out = [];

    // For each parent
    for (var i = 0; i < this.sortedParentIssues.length; i++) {
      var parent = this.sortedParentIssues[i];
      // Add parent row
      // If first row
      if (out.length === 0) {
        // Add header row and parent row
        var rows = parent.toRowArray();
        out.push(rows[0]);
        out.push(rows[1]);
      } else {
        // Otherwise just add parent row
        out.push(parent.toRowArray()[1]);
      }

      // For each child
      for (var cI = 0; cI < parent.children.length; cI++) {
        out.push(parent.children[cI].toRowArray()[1])
      }
    }

    return out;
  };

  /**
   * Style spreadsheet rows based on parent and child issues
   */
  this.styleRows = function () {
    var sheet = SpreadsheetApp.getActiveSheet();

    // Header row
    var hRange = sheet.getRange("1:1");
    hRange.setBackground("#cccccc");
    hRange.setFontWeight("bold");
    hRange.setHorizontalAlignment("center");
    hRange.setVerticalAlignment("middle");
    hRange.setWrap(true);

    // For each issue
    for (var id in this.issueToRowMap) {
      var issue = this.issues[id];
      var row = this.issueToRowMap[id];

      var range = sheet.getRange(row + ":" + row);

      // Center and wrap
      range.setHorizontalAlignment("center");
      range.setVerticalAlignment("middle");
      range.setWrap(true);

      // Set background
      if (issue.hasParent() === false) {// If parent issue
        // Gray background
        range.setBackground("#efefef");
      } else {// If child issue
        // White background
        range.setBackground("#ffffff");
      }

      // Set border
      if (issue.hasParent() === false) {// If parent issue
        // Border top
        range.setBorder(true, false, false, false, false, false);
      } else {// If child issue
        // No border
        range.setBorder(false, false, false, false, false, false);
      }
    }
  };

  return this;
}

// Configuration parameters
function getSourceSheetId() {
  return SpreadsheetApp.getActiveSpreadsheet().getSheets()[1].getRange("B1").getValue();
}

function getSourceIssueTree() {
  var sourceIssuesSheet = SpreadsheetApp.openById(getSourceSheetId());
  var sourceIssuesData = sourceIssuesSheet.getDataRange().getValues();

  var issues = Issue.fromRows(sourceIssuesData);
  var issueTree = IssueTree(issues);

  return issueTree;
}

function taskList() {
  var issueTree = getSourceIssueTree();
  return issueTree.toRowArray();
}

function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu("Redmine to G Sheets")
    .addItem("Format", "format")
    .addItem("Clear Formatting", "unFormat")
    .addToUi();
}

function format() {
  var issueTree = getSourceIssueTree();
  try {
    issueTree.styleRows();
  } catch (e) {
    SpreadsheetApp.getUi().alert("Failed to format rows: " + e);
  }
}

function unFormat() {
  var sheet = SpreadsheetApp.getActiveSheet();
  var mRows = sheet.getMaxRows();

  var range = sheet.getRange("A1:" + mRows);
  range.clearFormat();
}