// @vitest-environment happy-dom
import { TextWidth } from "../../Shared/TextWidth";
import { afterEach, expect, test, vi } from "vitest";

// happy-dom has no canvas, so measure 7px per character and record the font
let usedFont = "";
function stubCanvas() {
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
    set font(font: string) { usedFont = font; },
    measureText: (text: string) => ({ width: text.length * 7 - 0.5 }),
  } as any);
}

afterEach(() => {
  vi.restoreAllMocks();
});

test("Measures in the font of the element", () => {
  stubCanvas();
  let element = document.createElement("span");
  element.style.fontSize = "12px";
  element.style.fontWeight = "600";
  element.style.fontFamily = "Arial";
  document.body.append(element);
  let width = new TextWidth(element);
  expect(usedFont).toContain("12px");
  expect(usedFont).toContain("600");
  expect(usedFont).toContain("Arial");
  expect(width.of("GMT+5:30")).toBe(56);
  element.remove();
});

test("Longest word of a label that may wrap at spaces", () => {
  stubCanvas();
  let width = new TextWidth(document.body);
  expect(width.ofLongestWord("Head office Newfoundland")).toBe(84);
  expect(width.ofLongestWord("GMT+5:30")).toBe(56);
  expect(width.ofLongestWord("")).toBe(0);
});

test("Without canvas, every text is 0 wide", () => {
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
  let width = new TextWidth(document.body);
  expect(width.of("GMT+5:30")).toBe(0);
  expect(width.ofLongestWord("Head office")).toBe(0);
});
