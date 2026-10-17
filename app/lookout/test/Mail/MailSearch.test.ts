// @vitest-environment happy-dom
import { MailSearch, SearchScope } from "../../Mail/Search/MailSearch";
import { ReceivedRange, SizeRange } from "../../Mail/Search/SearchRanges";
import { expect, test } from "vitest";

test("Any refiner starts a search, like in Outlook", () => {
  let options = MailSearch.defaultOptions();
  expect(MailSearch.hasRefiners(options)).toBe(false);
  expect(MailSearch.hasRefiners({ ...options, isRead: false })).toBe(true);
  expect(MailSearch.hasRefiners({ ...options, hasAttachment: true })).toBe(true);
  expect(MailSearch.hasRefiners({ ...options, person: {} as any })).toBe(true);
  expect(MailSearch.hasRefiners({ ...options, isOutgoing: true })).toBe(true);
  expect(MailSearch.hasRefiners({ ...options, received: ReceivedRange.ThisWeek })).toBe(true);
  expect(MailSearch.hasRefiners({ ...options, size: SizeRange.Large })).toBe(true);
  expect(MailSearch.hasRefiners({ ...options, threadID: "<thread@example.com>" })).toBe(true);
  // The scope alone is no criterion
  expect(MailSearch.hasRefiners({ ...options, scope: SearchScope.AllAccounts })).toBe(false);
});

test("Scopes are named after accounts and folders", () => {
  expect(MailSearch.scopeLabel(SearchScope.AllAccounts)).toBe("All Accounts");
  expect(MailSearch.scopeLabel(SearchScope.CurrentAccount)).toBe("Current Account");
  expect(MailSearch.scopeLabel(SearchScope.CurrentFolder)).toBe("Current Folder");
  expect(MailSearch.scopeShortLabel(SearchScope.AllAccounts)).toBe("All");
  expect(MailSearch.scopeShortLabel(SearchScope.CurrentAccount)).toBe("Account");
  expect(MailSearch.scopeShortLabel(SearchScope.CurrentFolder)).toBe("Folder");
});
