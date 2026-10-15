import { SelectionState, TagState, type SelectableMessage } from "../../Mail/SelectionState";
import { expect, test } from "vitest";

function msg(props: Partial<SelectableMessage> & { tagList?: string[] } = {}): SelectableMessage {
  let tagList = props.tagList ?? [];
  return {
    isRead: false,
    isStarred: false,
    isSpam: false,
    tags: { contains: (tag: string) => tagList.includes(tag) },
    ...props,
  };
}

test("Read / Unread toggle: mark read unless all are read", () => {
  expect(SelectionState.shouldMarkRead([msg({ isRead: true }), msg({ isRead: true })])).toBe(false);
  expect(SelectionState.shouldMarkRead([msg({ isRead: true }), msg({ isRead: false })])).toBe(true);
  expect(SelectionState.shouldMarkRead([msg({ isRead: false })])).toBe(true);
  expect(SelectionState.allRead([])).toBe(false);
});

test("Flag toggle: flag unless all are flagged", () => {
  expect(SelectionState.shouldFlag([msg({ isStarred: true }), msg()])).toBe(true);
  expect(SelectionState.shouldFlag([msg({ isStarred: true })])).toBe(false);
  expect(SelectionState.allFlagged([msg({ isStarred: true }), msg()])).toBe(false);
  expect(SelectionState.allFlagged([])).toBe(false);
});

test("Junk state", () => {
  expect(SelectionState.allSpam([msg({ isSpam: true })])).toBe(true);
  expect(SelectionState.allSpam([msg({ isSpam: true }), msg()])).toBe(false);
});

test("Category state of a selection", () => {
  let messages = [msg({ tagList: ["red"] }), msg({ tagList: ["red", "blue"] })];
  expect(SelectionState.tagState(messages, "red")).toBe(TagState.All);
  expect(SelectionState.tagState(messages, "blue")).toBe(TagState.Some);
  expect(SelectionState.tagState(messages, "green")).toBe(TagState.None);
});
