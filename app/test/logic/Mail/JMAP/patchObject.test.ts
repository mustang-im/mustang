import { JMAPPatchObject } from "../../../../logic/Mail/JMAP/JMAPPatchObject";
import { expect, test } from "vitest";

test("Only changed properties, as paths", () => {
  let before = { name: { full: "Jane", isOrdered: true }, emails: { e1: { address: "a@example.com" }, e2: { address: "b@example.com" } } };
  let after = { name: { full: "Jane Doe", isOrdered: true }, emails: { e1: { address: "a@example.com" }, e2: { address: "c@example.com" } } };
  expect(JMAPPatchObject.diff(before, after)).toEqual({
    "name/full": "Jane Doe",
    "emails/e2/address": "c@example.com",
  });
});

test("Removed properties become null, added ones are set as a whole", () => {
  let before = { emails: { e1: { address: "a@example.com", label: "old" } }, notes: { n1: { note: "x" } } };
  let after = { emails: { e1: { address: "a@example.com" }, e2: { address: "b@example.com" } }, media: { m1: { kind: "photo", uri: "data:," } } };
  expect(JMAPPatchObject.diff(before, after)).toEqual({
    "emails/e1/label": null,
    "emails/e2": { address: "b@example.com" },
    "notes": null,
    "media": { m1: { kind: "photo", uri: "data:," } },
  });
});

test("Arrays are replaced as a whole", () => {
  let before = { name: { components: [{ kind: "given", value: "Jane" }, { kind: "surname", value: "Doe" }] } };
  let after = { name: { components: [{ kind: "given", value: "Jane" }, { kind: "surname", value: "Smith" }] } };
  expect(JMAPPatchObject.diff(before, after)).toEqual({
    "name/components": after.name.components,
  });
});

test("Keys with `/` and `~` are escaped", () => {
  let before = { relatedTo: { "https://example.com/jane": { relation: { friend: true } } } };
  let after = { relatedTo: { "https://example.com/jane": { relation: { spouse: true } }, "a~b": { relation: {} } } };
  expect(JMAPPatchObject.diff(before, after)).toEqual({
    "relatedTo/https:~1~1example.com~1jane/relation/friend": null,
    "relatedTo/https:~1~1example.com~1jane/relation/spouse": true,
    "relatedTo/a~0b": { relation: {} },
  });
});

test("No changes, no patch", () => {
  let card = { name: { full: "Jane" }, emails: { e1: { address: "a@example.com" } } };
  expect(JMAPPatchObject.diff(card, structuredClone(card))).toEqual({});
});
