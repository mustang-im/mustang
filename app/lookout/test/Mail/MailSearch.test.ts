// @vitest-environment happy-dom
import { MailSearch, SearchScope } from "../../Mail/Search/MailSearch";
import { globalSearchTerm } from "../../../frontend/AppsBar/selectedApp";
import { expect, test, beforeEach } from "vitest";
import { get } from "svelte/store";

beforeEach(() => {
  MailSearch.reset();
  globalSearchTerm.set(null);
});

test("A search needs a term, a person or a conversation", () => {
  let options = MailSearch.defaultOptions();
  expect(MailSearch.hasCriteria(null, options)).toBe(false);
  expect(MailSearch.hasCriteria("", options)).toBe(false);
  expect(MailSearch.hasCriteria("report", options)).toBe(true);
  // Refiners alone don't start a search, like in Outlook
  expect(MailSearch.hasCriteria(null, { ...options, unread: true, hasAttachment: true })).toBe(false);
  expect(MailSearch.hasCriteria(null, { ...options, person: {} as any })).toBe(true);
  expect(MailSearch.hasCriteria(null, { ...options, threadID: "<thread@example.com>" })).toBe(true);
});

test("Find Related replaces the search, but keeps the scope", () => {
  globalSearchTerm.set("report");
  MailSearch.update({ scope: SearchScope.AllAccounts, unread: true, flagged: true });
  MailSearch.findRelated({ threadID: "<thread@example.com>" });
  let options = MailSearch.current();
  expect(get(globalSearchTerm)).toBeNull();
  expect(options.threadID).toBe("<thread@example.com>");
  expect(options.scope).toBe(SearchScope.AllAccounts);
  expect(options.unread).toBe(false);
  expect(options.flagged).toBe(false);
  expect(options.person).toBeNull();
});

test("Close Search clears the term and the refiners, but keeps the scope", () => {
  globalSearchTerm.set("report");
  MailSearch.update({ scope: SearchScope.CurrentFolder, hasAttachment: true, person: {} as any, threadID: "<t>" });
  MailSearch.close();
  let options = MailSearch.current();
  expect(get(globalSearchTerm)).toBeNull();
  expect(options.scope).toBe(SearchScope.CurrentFolder);
  expect(options.hasAttachment).toBe(false);
  expect(options.person).toBeNull();
  expect(options.threadID).toBeNull();
  expect(MailSearch.hasCriteria(null, options)).toBe(false);
});

test("A message is in a conversation when it has a thread or replies to a message", () => {
  expect(MailSearch.isInConversation({ threadID: null, inReplyTo: null } as any)).toBe(false);
  expect(MailSearch.isInConversation({ threadID: "<root@example.com>", inReplyTo: null } as any)).toBe(true);
  expect(MailSearch.isInConversation({ threadID: null, inReplyTo: "<root@example.com>" } as any)).toBe(true);
});
