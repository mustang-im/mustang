import { SizeRange, SizeRanges } from "../../../Mail/Search/SearchRanges";
import { expect, test } from "vitest";

test("Size ranges don't overlap", () => {
  let previousMax = -1;
  for (let size of SizeRanges.named) {
    let bytes = SizeRanges.bytes(size);
    expect(bytes.min ?? 0).toBe(previousMax + 1);
    previousMax = bytes.max;
  }
  expect(previousMax).toBeNull();
  expect(SizeRanges.bytes(SizeRange.Any)).toEqual({ min: null, max: null });
});
