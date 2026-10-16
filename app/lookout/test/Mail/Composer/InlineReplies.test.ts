// @vitest-environment happy-dom
import { InlineReplies } from "../../../Mail/Composer/InlineReplies";
import type { ComposerCommands } from "../../../Mail/Composer/ComposerCommands";
import { MessageBox } from "../../../Shared/Dialog/MessageBox";
import type { EMail } from "../../../../logic/Mail/EMail";
import { afterEach, expect, test } from "vitest";
import { get } from "svelte/store";

function mail(html = ""): EMail {
  return { html } as EMail;
}

function commandsFor(draft: EMail): ComposerCommands {
  return { mail: draft } as ComposerCommands;
}

const kLongText = "<p>" + "This is what I want to say about it. ".repeat(4) + "</p>";

afterEach(() => {
  InlineReplies.replies.clear();
  InlineReplies.ribbon.set(null);
});

test("A reply is kept per original message", async () => {
  let first = mail();
  let second = mail();
  let firstDraft = mail();
  let secondDraft = mail();
  await InlineReplies.start(first, firstDraft);
  await InlineReplies.start(second, secondDraft);
  expect(InlineReplies.replyFor(first).draft).toBe(firstDraft);
  expect(InlineReplies.replyFor(second).draft).toBe(secondDraft);
  expect(InlineReplies.replyFor(first).isNew).toBe(true);
  expect(InlineReplies.hasReply(mail())).toBe(false);
  expect(InlineReplies.replyFor(null)).toBeNull();
});

test("A new response replaces an empty one without asking", async () => {
  let original = mail();
  let reply = mail("<p>Hi</p><blockquote>" + kLongText + "</blockquote>");
  let forward = mail();
  await InlineReplies.start(original, reply);
  await InlineReplies.start(original, forward);
  expect(get(MessageBox.current)).toBeNull();
  expect(InlineReplies.replyFor(original).draft).toBe(forward);
  expect(InlineReplies.replies.length).toBe(1);
});

test("A new response asks before it replaces one with text", async () => {
  let original = mail();
  let reply = mail(kLongText);
  await InlineReplies.start(original, reply);

  let keep = InlineReplies.start(original, mail());
  get(MessageBox.current).answer(false);
  await keep;
  expect(InlineReplies.replyFor(original).draft).toBe(reply);

  let forward = mail();
  let replace = InlineReplies.start(original, forward);
  get(MessageBox.current).answer(true);
  await replace;
  expect(InlineReplies.replyFor(original).draft).toBe(forward);
});

test("The ribbon shows the Message tab of the last shown reply, until that one closes", async () => {
  let first = mail();
  let second = mail();
  await InlineReplies.start(mail(), first);
  await InlineReplies.start(mail(), second);
  InlineReplies.showRibbon(first, commandsFor(first));
  InlineReplies.showRibbon(second, commandsFor(second));
  // The composer of the first reply is destroyed after the second one was shown
  InlineReplies.hideRibbon(first);
  expect(get(InlineReplies.ribbon).draft).toBe(second);

  InlineReplies.remove(second);
  expect(get(InlineReplies.ribbon)).toBeNull();
  expect(InlineReplies.replies.length).toBe(1);
  InlineReplies.remove(first);
  expect(InlineReplies.replies.isEmpty).toBe(true);
});
