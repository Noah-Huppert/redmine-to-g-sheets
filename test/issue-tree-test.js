describe("IssueTree", function() {
  beforeEach(function() {
    // Dummy issues used to test
    this.hasParentFalse = function() {
      return false;
    };

    this.hasParentTrue = function() {
      return true;
    };

    this.parent1 = {id: 1, parentId: undefined, children: [], hasParent: this.hasParentFalse};
    this.parent2 = {id: 2, parentId: undefined, children: [], hasParent: this.hasParentFalse};
    this.childof1 = {id: 3, parentId: 1, children: [], hasParent: this.hasParentTrue};
    this.childof2 = {id: 4, parentId: 2, children: [], hasParent: this.hasParentTrue};

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
      var issues = {4: this.childof2, 3: this.childof1, 2: this.parent2, 1: this.parent1};

      var it = new IssueTree(issues);
      this.assertContainsParents(it.parentIssues);
    });
  });
});