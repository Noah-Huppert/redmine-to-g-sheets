describe("Issue class", function () {
  describe("instance", function () {
    beforeEach(function () {
      this.i = new Issue(1,
        "TYPE",
        "#123",
        "STATUS",
        "PRIORITY",
        "SUBJECT",
        "ASSIGNEE",
        "UPDATED",
        "STARTDATE",
        "DUEDATE",
        "ESTIMATEDTIME",
        "PERCENTDONE",
        "CREATED",
        "CLOSED",
        "RAWRELATEDISSUES");
    });

    it("constructs", function () {
      expect(this.i.id).toEqual(1);
      expect(this.i.type).toEqual("TYPE");
      expect(this.i.parentId).toEqual("123");
      expect(this.i.status).toEqual("STATUS");
      expect(this.i.priority).toEqual("PRIORITY");
      expect(this.i.subject).toEqual("SUBJECT");
      expect(this.i.assignee).toEqual("ASSIGNEE");
      expect(this.i.updated).toEqual("UPDATED");
      expect(this.i.startDate).toEqual("STARTDATE");
      expect(this.i.dueDate).toEqual("DUEDATE");
      expect(this.i.estimatedTime).toEqual("ESTIMATEDTIME");
      expect(this.i.percentDone).toEqual("PERCENTDONE");
      expect(this.i.created).toEqual("CREATED");
      expect(this.i.closed).toEqual("CLOSED");
      expect(this.i.rawRelatedIssues).toEqual("RAWRELATEDISSUES");
    });

    it("hasParent", function () {
      expect(this.i.hasParent()).toEqual(true);

      this.i.parentId = "";
      expect(this.i.hasParent()).toEqual(false);

      this.i.parentId = undefined;
      expect(this.i.hasParent()).toEqual(false);
    });

    it("toRowArray", function () {
      expect(this.i.toRowArray()).toEqual([
        ["#", "Parent #", "Type", "Priority", "Status", "Subject", "Assignee", "Start date", "Due date", "Estimated time", "Percent done"],
        [1, "123", "TYPE", "PRIORITY", "STATUS", "SUBJECT", "ASSIGNEE", "STARTDATE", "DUEDATE", "ESTIMATEDTIME", "PERCENTDONE"]
      ]);
    });
  });

  describe("PRIORITY_SORT_VALUES makes sense", function () {
    it("Values ascend", function () {
      var lastValue = "NOT_SET";
      var i = 0;
      for (var key in Issue.PRIORITY_SORT_VALUES) {
        var val = Issue.PRIORITY_SORT_VALUES[key];
        if (i === 0) {
          lastValue = val - 1;
        }

        expect(val).toBeGreaterThan(lastValue);
      }
    });
  });

  describe("Issue factories", function () {
    it("fromRow", function () {
      var row = [1,
        "ROWINDEX1",
        "TYPE",
        "#123",
        "STATUS",
        "PRIORITY",
        "SUBJECT",
        "ROWIDNEX7",
        "ASSIGNEE",
        "UPDATED",
        "ROWINDEX10",
        "ROWINDEX11",
        "STARTDATE",
        "DUEDATE",
        "ESTIMATEDTIME",
        "PERCENTDONE",
        "CREATED",
        "CLOSED",
        "RAWRELATEDISSUES"
      ];

      var i = Issue.fromRow(row);

      expect(i.id).toEqual(1);
      expect(i.type).toEqual("TYPE");
      expect(i.parentId).toEqual("123");
      expect(i.status).toEqual("STATUS");
      expect(i.priority).toEqual("PRIORITY");
      expect(i.subject).toEqual("SUBJECT");
      expect(i.assignee).toEqual("ASSIGNEE");
      expect(i.updated).toEqual("UPDATED");
      expect(i.startDate).toEqual("STARTDATE");
      expect(i.dueDate).toEqual("DUEDATE");
      expect(i.estimatedTime).toEqual("ESTIMATEDTIME");
      expect(i.percentDone).toEqual("PERCENTDONE");
      expect(i.created).toEqual("CREATED");
      expect(i.closed).toEqual("CLOSED");
      expect(i.rawRelatedIssues).toEqual("RAWRELATEDISSUES");
    });


    it("fromRows", function () {
      var rows = [];
      for (var i = 0; i < 2; i++) {
        rows.push([i,
          "ROWINDEX1-" + i,
          "TYPE-" + i,
          "#123-" + i,
          "STATUS-" + i,
          "PRIORITY-" + i,
          "SUBJECT-" + i,
          "ROWINDEX7-" + i,
          "ASSIGNEE-" + i,
          "UPDATED-" + i,
          "ROWINDEX10-" + i,
          "ROWINDEX11-" + i,
          "STARTDATE-" + i,
          "DUEDATE-" + i,
          "ESTIMATEDTIME-" + i,
          "PERCENTDONE-" + i,
          "CREATED-" + i,
          "CLOSED-" + i,
          "RAWRELATEDISSUES-" + i
        ]);
      }

      var issues = Issue.fromRows(rows);

      for (var j = 0; i < 2; j++) {
        var i = issues[j];
        expect(i.id).toEqual(i);
        expect(i.type).toEqual("TYPE-" + i);
        expect(i.parentId).toEqual("123-" + i);
        expect(i.status).toEqual("STATUS-" + i);
        expect(i.priority).toEqual("PRIORITY-" + i);
        expect(i.subject).toEqual("SUBJECT-" + i);
        expect(i.assignee).toEqual("ASSIGNEE-" + i);
        expect(i.updated).toEqual("UPDATED-" + i);
        expect(i.startDate).toEqual("STARTDATE-" + i);
        expect(i.dueDate).toEqual("DUEDATE-" + i);
        expect(i.estimatedTime).toEqual("ESTIMATEDTIME-" + i);
        expect(i.percentDone).toEqual("PERCENTDONE-" + i);
        expect(i.created).toEqual("CREATED-" + i);
        expect(i.closed).toEqual("CLOSED-" + i);
        expect(i.rawRelatedIssues).toEqual("RAWRELATEDISSUES-" + i);
      }
    });
  });

  describe("compareIssues", function() {
    // TODO: After commit test this
  });
});