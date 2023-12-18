import { expect, test } from 'vitest'
import { Observable, notifyChangedProperty, notifyChangedAccessor } from '../../../logic/util/Observable';

class Test extends Observable {
  @notifyChangedProperty
  a = "a";
  _b = "b";

  @notifyChangedAccessor
  get b(): string {
    return this._b;
  }
  set b(val: string) {
    this._b = val;
  }
}

test("Property change calls observer", () => {
  let test = new Test();

  let step = 1;
  test.subscribe((val: Test) => {
    expect(val).toBe(test);
    if (step == 1) {
      expect(test.a).toBe("a");
      expect(test.b).toBe("b");
    } else if (step == 2) {
      expect(test.a).toBe("a2");
      expect(test.b).toBe("b");
    } else if (step == 3) {
      expect(test.a).toBe("a2");
      expect(test.b).toBe("b2");
    }
  });
  step++;
  test.a = "a2";
  step++;
  test.b = "b2";

  let numberOfAssertionsInSubscriber = 3;
  expect.assertions(step * numberOfAssertionsInSubscriber);
});
