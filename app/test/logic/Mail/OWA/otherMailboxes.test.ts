// @vitest-environment happy-dom
import { appGlobal } from "../../../../logic/app.ts"; // defeats circular import
import { OWAAccount } from "../../../../logic/Mail/OWA/OWAAccount";
import { OWAError } from "../../../../logic/Mail/OWA/OWAError";
import { expect, test } from "vitest";

/** What Outlook on the web saves when the user adds a shared mailbox */
const kOtherMailboxXML = `<OtherMailbox>` +
  `<entry displayName="Bob Builder" rootFolderId="" principalSMTPAddress="bob@example.com"></entry>` +
  `</OtherMailbox>`;

/** `callOWA()` returns the single response message of the server's answer */
class TestOWAAccount extends OWAAccount {
  readonly requests: any[] = [];
  response: () => any;

  async callOWA(request: any): Promise<any> {
    this.requests.push(JSON.parse(JSON.stringify(request)));
    return this.response();
  }
}

function newTestAccount(response: () => any): TestOWAAccount {
  appGlobal.remoteApp ??= { OWA: {} } as any; // `OWAAccount` needs the backend only for the login
  let account = new TestOWAAccount();
  account.username = "alice@example.com";
  account.emailAddress = account.username;
  account.response = response;
  return account;
}

test("OWA: Offer the mailboxes that the user added in Outlook on the web", async () => {
  let account = newTestAccount(() => ({
    __type: "GetUserConfigurationResponseMessage:#Exchange",
    ResponseClass: "Success",
    ResponseCode: "NoError",
    UserConfiguration: {
      __type: "ServiceUserConfiguration:#Exchange",
      XmlData: Buffer.from(kOtherMailboxXML, "utf-8").toString("base64"),
    },
  }));

  let persons = await account.availableSharedAccounts();

  expect(persons.contents.map(person => person.emailAddress)).toEqual(["bob@example.com"]);
  expect(persons.first.name).toBe("Bob Builder");
  expect(account.requests.length).toBe(1);
  let request = account.requests[0];
  expect(request.__type).toBe("GetUserConfigurationJsonRequest:#Exchange");
  expect(request.Body).toEqual({
    __type: "GetUserConfigurationRequest:#Exchange",
    UserConfigurationName: {
      __type: "UserConfigurationNameType:#Exchange",
      Name: "OWA.OtherMailbox",
      BaseFolderId: {
        __type: "DistinguishedFolderId:#Exchange",
        Id: "root",
      },
    },
    UserConfigurationProperties: "XmlData",
  });
});

test("OWA: The user never added a mailbox in Outlook on the web", async () => {
  let account = newTestAccount(() => {
    throw new OWAError({
      status: 200,
      json: {
        Body: {
          ResponseMessages: {
            Items: [{
              ResponseClass: "Error",
              ResponseCode: "ErrorItemNotFound",
              MessageText: "The specified object was not found in the store.",
            }],
          },
        },
      },
    });
  });

  let persons = await account.availableSharedAccounts();

  expect(persons.length).toBe(0);
});
