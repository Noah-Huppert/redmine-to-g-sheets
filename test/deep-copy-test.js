describe("Test deep copy", function() {
  it("Deep copies", function() {
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

  it("Respects recursionMax", function() {
    var initial = {
      a: {
        b: {
          c: {
            d: 1
          }
        }
      }
    };

   expect(function() {
      deepCopy(initial, 2);
    }).toThrow(new Error("Reached max recursion depth: 2"));
  })
});