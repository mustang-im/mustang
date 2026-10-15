import { ExternalContent } from "../../Mail/ReadingPane/ExternalContent";
import { expect, test } from "vitest";

test("External pictures, backgrounds, stylesheets and CSS URLs", () => {
  expect(ExternalContent.hasExternalContent(`<p>Hi</p><img src="https://tracker.example/pixel.gif">`)).toBe(true);
  expect(ExternalContent.hasExternalContent(`<IMG alt="x" SRC='http://example.com/a.png'>`)).toBe(true);
  expect(ExternalContent.hasExternalContent(`<img src=//cdn.example.com/a.png>`)).toBe(true);
  expect(ExternalContent.hasExternalContent(`<td background="https://example.com/bg.jpg">`)).toBe(true);
  expect(ExternalContent.hasExternalContent(`<div style="background-image: url('https://example.com/bg.jpg')">`)).toBe(true);
  expect(ExternalContent.hasExternalContent(`<link rel="stylesheet" href="https://example.com/a.css">`)).toBe(true);
  expect(ExternalContent.hasExternalContent(`<img srcset="https://example.com/a.png 2x">`)).toBe(true);
});

test("Links, inline and embedded pictures are not external content", () => {
  expect(ExternalContent.hasExternalContent(`<a href="https://example.com/">Link</a>`)).toBe(false);
  expect(ExternalContent.hasExternalContent(`<img src="cid:part1@example.com">`)).toBe(false);
  expect(ExternalContent.hasExternalContent(`<img src="data:image/png;base64,iVBORw0KGgo=">`)).toBe(false);
  expect(ExternalContent.hasExternalContent(`<p>See https://example.com/image.png</p>`)).toBe(false);
  expect(ExternalContent.hasExternalContent("")).toBe(false);
  expect(ExternalContent.hasExternalContent(null)).toBe(false);
});
