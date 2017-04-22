"use strict";

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
 * @constructor
 */
function Issue(id, type, parentId, status, priority, subject, assignee, startDate, dueDate, estimatedTime, percentDone) {
    // Constructor
    var self = this;

    self.id = id;
    self.type = type;
    self.parentId = parentId;
    self.status = status;
    self.priority = priority;
    self.subject = subject;
    self.assignee = assignee;
    self.startDate = startDate;
    self.dueDate = dueDate;
    self.estimatedTime = estimatedTime;
    self.percentDone = percentDone;

    return self;
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
 * @returns Array of Issues
 */
Issue.fromRows = function (rows) {
    var issues = [];

    for (var i = 0; i < rows.length; i++) {
        issues.push(Issue.fromRow(rows[i]));
    }

    return issues;
};


// Configuration parameters
var sourceIssuesSheetId = "1RJmN9WXBP-T5djhRad-Xs-nIZPe-QogtMfEuTlY145I";

function taskList() {
    var sourceIssuesSheet = SpreadsheetApp.openById(sourceIssuesSheetId);
    var sourceIssuesData = sourceIssuesSheet.getDataRange().getValues();

    var issues = Issue.fromRows(sourceIssuesData);
    Logger.info(issues[0].id);

    return [];
}