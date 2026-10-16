// @vitest-environment happy-dom
import { MailSearch, SearchScope } from "../../Mail/Search/MailSearch";
import { ReceivedRange, SizeRange } from "../../Mail/Search/SearchRanges";
import { globalSearchTerm } from "../../../frontend/AppsBar/selectedApp";
import { expect, test, beforeEach } from "vitest";
import { get } from "svelte/store";

beforeEach(() => {
  MailSearch.reset();
  globalSearchTerm.set(null);
});

test("A search starts with a term or any refiner, like in Outlook", () => {
  let options = MailSearch.defaultOptions();
  expect(MailSearch.hasCriteria(null, options)).toBe(false);
  expect(MailSearch.hasCriteria("", options)).toBe(false);
  expect(MailSearch.hasCriteria("report", options)).toBe(true);
  expect(MailSearch.hasCriteria(null, { ...options, isRead: false })).toBe(true);
  expect(MailSearch.hasCriteria(null, { ...options, hasAttachment: true })).toBe(true);
  expect(MailSearch.hasCriteria(null, { ...options, person: {} as any })).toBe(true);
  expect(MailSearch.hasCriteria(null, { ...options, isOutgoing: true })).toBe(true);
  expect(MailSearch.hasCriteria(null, { ...options, received: ReceivedRange.ThisWeek })).toBe(true);
  expect(MailSearch.hasCriteria(null, { ...options, size: SizeRange.Large })).toBe(true);
  expect(MailSearch.hasCriteria(null, { ...options, threadID: "<thread@example.com>" })).toBe(true);
  // The scope alone is no criterion
  expect(MailSearch.hasCriteria(null, { ...options, scope: SearchScope.AllAccounts })).toBe(false);
});

test("Find Related replaces the search, but keeps the scope", () => {
  globalSearchTerm.set("report");
  MailSearch.update({ scope: SearchScope.AllAccounts, isRead: false, flagged: true });
  MailSearch.findRelated({ threadID: "<thread@example.com>" });
  let options = MailSearch.current();
  expect(get(globalSearchTerm)).toBeNull();
  expect(options.threadID).toBe("<thread@example.com>");
  expect(options.scope).toBe(SearchScope.AllAccounts);
  expect(options.isRead).toBeNull();
  expect(options.flagged).toBe(false);
  expect(options.person).toBeNull();
});

test("Close Search clears the term and the refiners, but keeps the scope", () => {
  globalSearchTerm.set("report");
  MailSearch.update({ scope: SearchScope.CurrentFolder, hasAttachment: true, person: {} as any, threadID: "<t>", size: SizeRange.Huge });
  MailSearch.close();
  let options = MailSearch.current();
  expect(get(globalSearchTerm)).toBeNull();
  expect(options.scope).toBe(SearchScope.CurrentFolder);
  expect(options.hasAttachment).toBe(false);
  expect(options.person).toBeNull();
  expect(options.threadID).toBeNull();
  expect(options.size).toBe(SizeRange.Any);
  expect(MailSearch.hasCriteria(null, options)).toBe(false);
});

test("From, Sent To and Sent by Me share the person and the direction", () => {
  let person = { name: "Nick" } as any;
  MailSearch.setFrom(person);
  expect(MailSearch.isFrom(MailSearch.current())).toBe(true);
  expect(MailSearch.isSentTo(MailSearch.current())).toBe(false);
  expect(MailSearch.current().isOutgoing).toBe(false);

  MailSearch.setSentTo(person);
  expect(MailSearch.isFrom(MailSearch.current())).toBe(false);
  expect(MailSearch.isSentTo(MailSearch.current())).toBe(true);

  MailSearch.setSentByMe(true);
  expect(MailSearch.current().person).toBeNull();
  expect(MailSearch.isSentByMe(MailSearch.current())).toBe(true);
  expect(MailSearch.isSentTo(MailSearch.current())).toBe(false);

  MailSearch.setSentByMe(false);
  expect(MailSearch.current().isOutgoing).toBeNull();
  expect(MailSearch.hasRefiners(MailSearch.current())).toBe(false);
});

test("Messages from or to Sender counts as From", () => {
  MailSearch.findRelated({ person: { name: "Nick" } as any });
  expect(MailSearch.isFrom(MailSearch.current())).toBe(true);
  expect(MailSearch.current().isOutgoing).toBeNull();
});

test("A message is in a conversation when it has a thread or replies to a message", () => {
  expect(MailSearch.isInConversation({ threadID: null, inReplyTo: null } as any)).toBe(false);
  expect(MailSearch.isInConversation({ threadID: "<root@example.com>", inReplyTo: null } as any)).toBe(true);
  expect(MailSearch.isInConversation({ threadID: null, inReplyTo: "<root@example.com>" } as any)).toBe(true);
});

test("Scopes have Outlook's names", () => {
  expect(MailSearch.scopeLabel(SearchScope.AllAccounts)).toBe("All Mailboxes");
  expect(MailSearch.scopeLabel(SearchScope.CurrentAccount)).toBe("Current Mailbox");
  expect(MailSearch.scopeLabel(SearchScope.CurrentFolder)).toBe("Current Folder");
  expect(MailSearch.scopeShortLabel(SearchScope.AllAccounts)).toBe("All");
  expect(MailSearch.scopeShortLabel(SearchScope.CurrentAccount)).toBe("Mailbox");
  expect(MailSearch.scopeShortLabel(SearchScope.CurrentFolder)).toBe("Folder");
});
