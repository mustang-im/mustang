// @vitest-environment happy-dom
import { appGlobal } from "../../../../logic/app.ts"; // defeats circular import
import { EWSAccount } from "../../../../logic/Mail/EWS/EWSAccount";
import { FilterRuleAction } from "../../../../logic/Mail/FilterRules/FilterRuleAction";
import { AuthMethod } from "../../../../logic/Abstract/Account";
import { Person } from "../../../../logic/Abstract/Person";
import { expect, test } from "vitest";

appGlobal.me ??= new Person();

/** Exchange prefixes the elements with `m:` and `t:`, but happy-dom's
 * `querySelector()` does not find prefixed elements, unlike Chromium,
 * so these responses use default namespaces. */
const kNewslettersRule = `
  <Rule xmlns="http://schemas.microsoft.com/exchange/services/2006/types">
    <RuleId>rule-1</RuleId>
    <DisplayName>Newsletters</DisplayName>
    <Priority>1</Priority>
    <IsEnabled>true</IsEnabled>
    <IsNotSupported>false</IsNotSupported>
    <Conditions>
      <FromAddresses>
        <Address><Name>ACME News</Name><EmailAddress>news@acme.example</EmailAddress><RoutingType>SMTP</RoutingType></Address>
      </FromAddresses>
      <SentToMe>true</SentToMe>
    </Conditions>
    <Exceptions>
      <ContainsSubjectStrings><String>urgent</String></ContainsSubjectStrings>
    </Exceptions>
    <Actions>
      <MoveToFolder><FolderId Id="folder-newsletters" ChangeKey="AQAAAA=="/></MoveToFolder>
      <StopProcessingRules>true</StopProcessingRules>
    </Actions>
  </Rule>`;

const kInvoicesRule = `
  <Rule xmlns="http://schemas.microsoft.com/exchange/services/2006/types">
    <RuleId>rule-2</RuleId>
    <DisplayName>Invoices</DisplayName>
    <Priority>2</Priority>
    <IsEnabled>true</IsEnabled>
    <Conditions>
      <ContainsSubjectOrBodyStrings><String>invoice</String></ContainsSubjectOrBodyStrings>
    </Conditions>
    <Actions>
      <MarkAsRead>true</MarkAsRead>
    </Actions>
  </Rule>`;

function envelope(body: string): string {
  return `<?xml version="1.0" encoding="utf-8"?>
    <Envelope xmlns="http://schemas.xmlsoap.org/soap/envelope/"><Body>${body}</Body></Envelope>`;
}

/** An Exchange server with inbox rules.
 * Answers `GetInboxRules` with `rules`, and remembers the `UpdateInboxRules` requests. */
function newTestAccount(rules: string[]) {
  let account = new EWSAccount();
  account.name = "Alice";
  account.username = "alice@example.com";
  account.emailAddress = account.username;
  account.url = "https://exchange.example.com/EWS/Exchange.asmx";
  account.authMethod = AuthMethod.Unknown; // no credentials needed
  let updates: Document[] = [];
  let server = {
    rules,
    /** What the server does with the update */
    onUpdate: () => {},
    updateResponse: `<UpdateInboxRulesResponse ResponseClass="Success" xmlns="http://schemas.microsoft.com/exchange/services/2006/messages">
      <ResponseCode>NoError</ResponseCode>
    </UpdateInboxRulesResponse>`,
  };
  globalThis.fetch = (async (_url: string, options: any) => {
    let request = new DOMParser().parseFromString(options.body, "text/xml");
    if (request.getElementsByTagName("m:UpdateInboxRules").length) {
      updates.push(request);
      server.onUpdate();
      return { status: 200, text: async () => envelope(server.updateResponse) };
    }
    return {
      status: 200,
      text: async () => envelope(`<GetInboxRulesResponse ResponseClass="Success" xmlns="http://schemas.microsoft.com/exchange/services/2006/messages">
        <ResponseCode>NoError</ResponseCode>
        <OutlookRuleBlobExists>false</OutlookRuleBlobExists>
        <InboxRules>${server.rules.join("")}</InboxRules>
      </GetInboxRulesResponse>`),
    };
  }) as any;
  return { account, updates, server };
}

function localRule(account: EWSAccount, name: string): FilterRuleAction {
  let rule = new FilterRuleAction(account);
  rule.name = name;
  rule.markAsRead = true;
  account.filterRuleActions.add(rule);
  return rule;
}

function rule(account: EWSAccount, name: string): FilterRuleAction {
  return account.filterRuleActions.find(rule => rule.name == name);
}

function childNames(element: Element): string[] {
  return [...element.children].map(child => child.localName);
}

test("EWS: The server rules come in the order in which the server runs them, and the local rules stay", async () => {
  let { account } = newTestAccount([kInvoicesRule, kNewslettersRule]);
  let local = localRule(account, "Local");

  await account.refreshServerFilterRules();

  expect(account.filterRuleActions.contents).toContain(local);
  let serverRules = account.filterRuleActions.contents.filter(rule => rule.server);
  expect(serverRules.map(rule => rule.name)).toEqual(["Newsletters", "Invoices"]);
  let newsletters = rule(account, "Newsletters");
  expect(newsletters.criteria.includesPerson?.emailAddresses.first?.value).toBe("news@acme.example");
  expect(newsletters.toFolderID).toBe("folder-newsletters");
  expect(newsletters.copy).toBeFalsy();
  let invoices = rule(account, "Invoices");
  expect(invoices.criteria.bodyText).toBe("invoice");
  expect(invoices.markAsRead).toBe(true);
});

test("EWS: A server rule that the user changes keeps the parts that we don't understand", async () => {
  let { account, updates } = newTestAccount([kNewslettersRule, kInvoicesRule]);
  await account.refreshServerFilterRules();

  rule(account, "Newsletters").criteria.bodyText = "acme";
  await account.saveServerFilterRules();

  expect(updates.length).toBe(1);
  let update = updates[0];
  expect(update.getElementsByTagName("m:RemoveOutlookRuleBlob")[0].textContent).toBe("false");
  // Only the changed rule
  let setRules = [...update.getElementsByTagName("t:SetRuleOperation")].map(operation => operation.getElementsByTagName("t:Rule")[0]);
  expect(setRules.length).toBe(1);
  expect(update.getElementsByTagName("t:CreateRuleOperation").length).toBe(0);
  expect(update.getElementsByTagName("t:DeleteRuleOperation").length).toBe(0);
  let sent = setRules[0];
  expect(sent.getElementsByTagName("t:RuleId")[0].textContent).toBe("rule-1");
  // The server refuses to set it
  expect(sent.getElementsByTagName("t:IsNotSupported").length).toBe(0);
  // in schema order
  let conditions = sent.getElementsByTagName("t:Conditions")[0];
  expect(childNames(conditions)).toEqual(["ContainsSubjectOrBodyStrings", "FromAddresses", "SentToMe"]);
  expect(conditions.getElementsByTagName("t:ContainsSubjectOrBodyStrings")[0].textContent).toBe("acme");
  expect(conditions.getElementsByTagName("t:Name")[0].textContent).toBe("ACME News");
  expect(sent.getElementsByTagName("t:Exceptions")[0].getElementsByTagName("t:String")[0].textContent).toBe("urgent");
  let actions = sent.getElementsByTagName("t:Actions")[0];
  expect(childNames(actions)).toEqual(["MoveToFolder", "StopProcessingRules"]);
  let folder = actions.getElementsByTagName("t:FolderId")[0];
  expect(folder.getAttribute("Id")).toBe("folder-newsletters");
  expect(folder.getAttribute("ChangeKey")).toBe("AQAAAA==");
});

test("EWS: Saving without changes does not change the server rules", async () => {
  let { account, updates } = newTestAccount([kNewslettersRule, kInvoicesRule]);
  await account.refreshServerFilterRules();

  await account.saveServerFilterRules();

  expect(updates).toEqual([]);
});

test("EWS: Create, delete and reorder server rules", async () => {
  let { account, updates, server } = newTestAccount([kNewslettersRule, kInvoicesRule]);
  await account.refreshServerFilterRules();
  account.filterRuleActions.remove(rule(account, "Newsletters"));
  let created = localRule(account, "Created");
  created.criteria.bodyText = "offer";
  created.server = true;
  server.onUpdate = () => server.rules = [
    kInvoicesRule.replace("<Priority>2", "<Priority>1"),
    kInvoicesRule.replace("rule-2", "rule-3").replace("Invoices", "Created"), // with a new ID
  ];

  await account.saveServerFilterRules();

  expect(updates.length).toBe(1);
  let update = updates[0];
  let deleted = update.getElementsByTagName("t:DeleteRuleOperation");
  expect([...deleted].map(operation => operation.textContent.trim())).toEqual(["rule-1"]);
  let create = update.getElementsByTagName("t:CreateRuleOperation")[0].getElementsByTagName("t:Rule")[0];
  expect(create.getElementsByTagName("t:RuleId").length).toBe(0);
  expect(create.getElementsByTagName("t:DisplayName")[0].textContent).toBe("Created");
  // "Invoices" moved up
  let set = update.getElementsByTagName("t:SetRuleOperation")[0].getElementsByTagName("t:Rule")[0];
  expect(set.getElementsByTagName("t:RuleId")[0].textContent).toBe("rule-2");
  expect(set.getElementsByTagName("t:Priority")[0].textContent).toBe("1");
  expect(Number(create.getElementsByTagName("t:Priority")[0].textContent)).toBeGreaterThan(1);
  expect(created.serverID).toBe("rule-3");
  expect(account.filterRuleActions.contents.filter(rule => rule.server).map(rule => rule.name)).toEqual(["Invoices", "Created"]);
});

test("EWS: A rule that the user made local again is deleted on the server", async () => {
  let { account, updates } = newTestAccount([kNewslettersRule, kInvoicesRule]);
  await account.refreshServerFilterRules();
  let invoices = rule(account, "Invoices");

  invoices.server = false;
  await account.saveServerFilterRules();

  let deleted = updates[0].getElementsByTagName("t:DeleteRuleOperation");
  expect([...deleted].map(operation => operation.textContent.trim())).toEqual(["rule-2"]);
  expect(invoices.serverID).toBeNull();
  expect(account.filterRuleActions.contents).toContain(invoices);
});

test("EWS: A criterion that Exchange cannot check is not saved to the server", async () => {
  let { account, updates } = newTestAccount([kNewslettersRule]);
  await account.refreshServerFilterRules();

  rule(account, "Newsletters").criteria.isReplied = false;

  await expect(account.saveServerFilterRules()).rejects.toThrow();
  expect(updates).toEqual([]);
});

test("EWS: Rules that Outlook runs are not deleted", async () => {
  let { account, server } = newTestAccount([kNewslettersRule]);
  await account.refreshServerFilterRules();
  server.updateResponse = `<UpdateInboxRulesResponse ResponseClass="Error" xmlns="http://schemas.microsoft.com/exchange/services/2006/messages">
    <MessageText>Outlook rule blob exists.</MessageText>
    <ResponseCode>ErrorOutlookRuleBlobExists</ResponseCode>
  </UpdateInboxRulesResponse>`;

  rule(account, "Newsletters").markAsRead = true;

  await expect(account.saveServerFilterRules()).rejects.toThrow(/Outlook/);
});
