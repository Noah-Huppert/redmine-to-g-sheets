"use strict";

var RECURSION_MAX_DEFAULT = 20;

/**
 * Attempts to deep copy an object
 * @param obj Object to copy
 * @param recursionCounter How deep recursion has gone
 * @param recursionMax Max recursion depth
 * @returns {{}} Deep copy of obj
 */
function deepCopy(obj, recursionCounter, recursionMax) {
    // Recursion
    if (recursionCounter === undefined) {
        recursionCounter = 0;
    } else {
        recursionCounter += 1;
    }

    if (recursionMax === undefined) {
        recursionMax = RECURSION_MAX_DEFAULT;
    } else if (recursionCounter > recursionMax) {
        throw Error("Reached max recursion depth: " + recursionMax);
    }

    // Copy
    var newCopy = {};

    // For each key
    for (var key in obj) {
        // If object
        if (typeof obj[key] === Object) {
            // Recursion
            newCopy[key] = deepCopy(obj[key], recursionCounter, recursionMax);
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
 * @param parendId Parent Id or undefined if parent
 * @param status Current status of issue
 * @param priority How important issue is
 * @param subject Short summary of issue
 * @param assignee Team member assigned to issue
 * @param startDate Task start date
 * @param dueDate Task due date
 * @param estimatedTime Estimated issue completion time
 * @param percentDone Issue Completion
 * @returns {Issue}
 * @constructor
 */
function Issue(id, type, parentId, status, priority, subject, assignee, startDate, dueDate, estimatedTime, percentDone) {
    // Constructor
    this.id = id;
    this.type = type;
    this.parentId = parentId.substr(1);
    this.status = status;
    this.priority = priority;
    this.subject = subject;
    this.assignee = assignee;
    this.startDate = startDate;
    this.dueDate = dueDate;
    this.estimatedTime = estimatedTime;
    this.percentDone = percentDone;

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

// Source Issues Sheet Colums
Issue.COLUMNS = {
    id: 0,
    tracker: 2,
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

    return Issue.apply(null, args);
};

/**
 * Returns array of Issues from Source Issues Sheet rows
 * @param rows Rows of Issues
 * @returns Map of Issues
 */
Issue.fromRows = function (rows) {
    var issues = {};

    for (var i = 0; i < rows.length; i++) {
        var issue = Issue.fromRow(rows[i]);
        // Check that we aren't reading a column header row
        if (issue.id !== "#") {
            issues[issue.id] = issue;
        }
    }

    return issues;
};

// IssueTree Class
/**
 * Class which stores Issue class tree, used to represent parent and child tasks.
 * Simplified to deal with only Redmine issues 1 level deep.
 * @param issues Issues map to construct tree out of
 * @returns {IssueTree}
 * @constructor
 */
function IssueTree(issues) {
    this.parentIssues = {};

    // For each issue
    for (var id in issues) {
        var issue = issues[id];

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
    }

    /**
     * Convert IssueTree into Row Array to be returned from spreadsheet function
     * @returns {Array}
     */
    this.toRowArray = function () {
        var out = [];


        // For each parent
        for (var pId in this.parentIssues) {
            // Add parent row
            var parent = this.parentIssues[pId];

            // If first row
            if (out.length === 0) {
                // Add header row and parent row
                var rows = parent.issue.toRowArray();
                out.push(rows[0]);
                out.push(rows[1]);
            } else {
                // Otherwise just add parent row
                out.push(parent.issue.toRowArray()[1]);
            }

            // For each child
            for (var cId in parent.children) {
                var child = parent.children[cId];

                out.push(child.toRowArray()[1])
            }
        }

        return out;
    };

    return this;
}

// Configuration parameters
var sourceIssuesSheetId = "1RJmN9WXBP-T5djhRad-Xs-nIZPe-QogtMfEuTlY145I";

function taskList() {
    var sourceIssuesSheet = SpreadsheetApp.openById(sourceIssuesSheetId);
    var sourceIssuesData = sourceIssuesSheet.getDataRange().getValues();

    var issues = Issue.fromRows(sourceIssuesData);
    var issueTree = IssueTree(issues);

    return issueTree.toRowArray();
}