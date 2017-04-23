describe("Issue class", function () {
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

  it("hasParent", function() {
    expect(this.i.hasParent()).toEqual(true);

    this.i.parentId = "";
    expect(this.i.hasParent()).toEqual(false);

    this.i.parentId = undefined;
    expect(this.i.hasParent()).toEqual(false);
  });

  it("toRowArray", function() {
    expect(this.i.toRowArray()).toEqual([
      ["#", "Parent #", "Type", "Priority", "Status", "Subject", "Assignee", "Start date", "Due date", "Estimated time", "Percent done"],
      [1, "123", "TYPE", "PRIORITY", "STATUS", "SUBJECT", "ASSIGNEE", "STARTDATE", "DUEDATE", "ESTIMATEDTIME", "PERCENTDONE"]
    ]);
  });
})
;