// @vitest-environment happy-dom
import { InlineReplies, InlineReply } from "../../../Mail/Composer/InlineReplies";
import { inlineReplies, inlineRibbon } from "../../../Mail/Selected";
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

function replyFor(original: EMail) {
  return inlineReplies.find(reply => reply.original == original) ?? null;
}

afterEach(() => {
  inlineReplies.clear();
  inlineRibbon.set(null);
});

test("A reply is kept per original message", async () => {
  let first = mail();
  let second = mail();
  let firstDraft = mail();
  let secondDraft = mail();
  await InlineReplies.start(first, firstDraft);
  await InlineReplies.start(second, secondDraft);
  expect(replyFor(first).draft).toBe(firstDraft);
  expect(replyFor(second).draft).toBe(secondDraft);
  expect(replyFor(first).isNew).toBe(true);
  expect(replyFor(mail())).toBeNull();
});

test("A new response replaces an empty one without asking", async () => {
  let original = mail();
  let reply = mail("<p>Hi</p><blockquote>" + kLongText + "</blockquote>");
  let forward = mail();
  await InlineReplies.start(original, reply);
  await InlineReplies.start(original, forward);
  expect(get(MessageBox.current)).toBeNull();
  expect(replyFor(original).draft).toBe(forward);
  expect(inlineReplies.length).toBe(1);
});

test("A new response asks before it replaces one with text", async () => {
  let original = mail();
  let reply = mail(kLongText);
  await InlineReplies.start(original, reply);

  let keep = InlineReplies.start(original, mail());
  get(MessageBox.current).answer(false);
  await keep;
  expect(replyFor(original).draft).toBe(reply);

  let forward = mail();
  let replace = InlineReplies.start(original, forward);
  get(MessageBox.current).answer(true);
  await replace;
  expect(replyFor(original).draft).toBe(forward);
});

test("Removing a reply hides its Message tab", async () => {
  let first = mail();
  let second = mail();
  await InlineReplies.start(mail(), first);
  await InlineReplies.start(mail(), second);
  inlineRibbon.set({ draft: second, commands: commandsFor(second) });
  InlineReplies.remove(first);
  expect(get(inlineRibbon).draft).toBe(second);
  inlineReplies.add(new InlineReply(mail(), first));

  InlineReplies.remove(second);
  expect(get(inlineRibbon)).toBeNull();
  expect(inlineReplies.length).toBe(1);
  InlineReplies.remove(first);
  expect(inlineReplies.isEmpty).toBe(true);
});
