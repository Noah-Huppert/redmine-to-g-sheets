describe("Test deep copy", function () {
  it("Deep copies", function () {
    var initial = {
      a: 2,
      b: {
        z: -1,
        i: 9
      }
    };
    expect(deepCopy(initial)).toEqual({
      a: 2,
      b: {
        z: -1,
        i: 9
      }
    });
  });

  it("Respects recursionMax", function () {
    var initial = {
      a: {
        b: {
          c: {
            d: 1
          }
        }
      }
    };

    expect(function () {
      deepCopy(initial, 2);
    }).toThrow(new Error("Reached max recursion depth: 2"));
  });

  it("Copies dates", function () {
    var initial = {
        a: 1,
        b: {
          c: 2,
          d: 3
        },
        e: new Date(2000, 8, 20)
      };

    expect(deepCopy(initial)).toEqual({
      a: 1,
      b: {
        c: 2,
        d: 3
      },
      e: new Date(2000, 8, 20)
    });
  });

  it("Copies arrays", function() {
    var initial = {
      a: 1,
      b: {
        c: 2,
        d: 3
      },
      e: []
    };

    expect(deepCopy(initial)).toEqual({
      a: 1,
      b: {
        c: 2,
        d: 3
      },
      e: []
    });
  })
});