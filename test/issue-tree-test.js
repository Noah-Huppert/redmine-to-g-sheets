describe("IssueTree", function() {
  beforeEach(function() {
    // Dummy issues used to test
    this.hasParentFalse = function() {
      return false;
    };

    this.hasParentTrue = function() {
      return true;
    };

    this.parent1 = {id: 1, parentId: undefined, children: [], startDate: new Date(2000), hasParent: this.hasParentFalse};
    this.parent2 = {id: 2, parentId: undefined, children: [], startDate: new Date(2001), hasParent: this.hasParentFalse};
    this.childof1 = {id: 3, parentId: 1, children: [], startDate: new Date(1990), hasParent: this.hasParentTrue};
    this.childof2 = {id: 4, parentId: 2, children: [], startDate: new Date(1990), hasParent: this.hasParentTrue};
    this.otherChildOf1 = {id: 5, parentId: 1, children: [], startDate: new Date(1991), hasParent: this.hasParentTrue};
    this.otherChildOf2 = {id: 6, parentId: 2, children: [], startDate: new Date(1991), hasParent: this.hasParentTrue};

    this.allIssues = {1: this.parent1, 2: this.parent2, 3: this.childof1, 4: this.childof2, 5: this.otherChildOf1, 6: this.otherChildOf2};
    this.allIssuesBackwards = {6: this.otherChildOf2, 5: this.otherChildOf1, 4: this.childof2, 3: this.childof1, 2: this.parent2, 1: this.parent1};

    /**
     * Common assert pattern of checking IssueTree.parentIssues contains this.parent1 and this.parent2
     */
    this.assertContainsParents = function(parentIssues) {
      var keys = Object.getOwnPropertyNames(parentIssues);

      // Check ids in parentIssues map
      expect(keys.indexOf("1") !== -1).toEqual(true);
      expect(keys.indexOf("2") !== -1).toEqual(true);

      for (var i = 0; i < 2; i++) {
        var entry = parentIssues[keys[i]];

        var parent = undefined;
        if (i === 0) {
          parent = this.parent1;
        } else  if (i === 1) {
          parent = this.parent2;
        }

        var child = undefined;
        if (i === 0) {
          child = this.childof1;
        } else if (i === 1) {
          child = this.childof2;
        }

        expect(entry.issue).toEqual(parent);
        expect(child.id in entry.children).toEqual(true);
        expect(entry.children[child.id]).toEqual(child);
      }
    };
  });

  describe("constructor", function() {
    it("works when parents are mentioned before they are defined", function() {
      var it = new IssueTree(this.allIssuesBackwards);
      this.assertContainsParents(it.parentIssues);
    });

    it("works when parents are mentioned after they are defined", function() {
      var it = new IssueTree(this.allIssues);
      this.assertContainsParents(it.parentIssues);
    });

    it("sorts parent issues", function() {
      var it = new IssueTree(this.allIssues);

      expect(it.sortedParentIssues[0]).toEqual(this.parent1);
      expect(it.sortedParentIssues[0].children[0]).toEqual(this.childof1);
      expect(it.sortedParentIssues[0].children[1]).toEqual(this.otherChildOf1);

      expect(it.sortedParentIssues[1]).toEqual(this.parent2);
      expect(it.sortedParentIssues[1].children[0]).toEqual(this.childof2);
      expect(it.sortedParentIssues[1].children[1]).toEqual(this.otherChildOf2)
    });

    it("generates issuesToRowMap", function() {
      var it = new IssueTree(this.allIssuesBackwards);

      expect(it.issueToRowMap["1"]).toEqual(2);
      expect(it.issueToRowMap["3"]).toEqual(3);
      expect(it.issueToRowMap["5"]).toEqual(4);

      expect(it.issueToRowMap["2"]).toEqual(5);
      expect(it.issueToRowMap["4"]).toEqual(6);
      expect(it.issueToRowMap["6"]).toEqual(7);
    });
  });
});