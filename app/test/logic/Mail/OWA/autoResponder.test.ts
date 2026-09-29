// app first, to resolve the import cycle around Abstract/Account.ts
import { appGlobal } from "../../../../logic/app";
import { OWAAccount } from "../../../../logic/Mail/OWA/OWAAccount";
import { EWSAccount } from "../../../../logic/Mail/EWS/EWSAccount";
import { AutoResponderAudience } from "../../../../logic/Mail/AutoResponder";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

// DOMPurify needs a real browser DOM
vi.mock("../../../../logic/util/convertHTML", async importOriginal => ({
  ...await importOriginal() as object,
  sanitizeHTML: (html: string) => "sanitized:" + html,
  convertTextToHTML: (text: string) => "converted:" + text,
}));

/** The HTTP calls that the account made */
let calls: { url: string, action: string, body: any }[] = [];
/** What the server answers, as JSON */
let response: any;

beforeEach(() => {
  appGlobal.remoteApp = { OWA: {} } as any;
  calls = [];
  vi.stubGlobal("fetch", async (url: string, options: any) => {
    calls.push({ url, action: options.headers.Action, body: JSON.parse(options.body) });
    return {
      ok: true,
      status: 200,
      statusText: "OK",
      url,
      headers: new Headers({ "Content-Type": "application/json; charset=utf-8" }),
      text: async () => JSON.stringify(response),
    };
  });
});
afterEach(() => vi.unstubAllGlobals());

class TestOWAAccount extends OWAAccount {
  hasLoggedIn = true;
}

function newAccount(): TestOWAAccount {
  let account = new TestOWAAccount();
  account.url = "https://mail.example.com/owa/";
  account.emailAddress = "user1@example.com";
  account.authorizationHeader = "Bearer TEST";
  return account;
}

function body(json: any) {
  return { Header: { ServerVersionInfo: { MajorVersion: 15 } }, Body: json };
}

const kSuccess = { ResponseClass: "Success", ResponseCode: "NoError" };

// The same as EWS, but as JSON
const kGetResponse = body({
  __type: "GetUserOofSettingsResponse:#Exchange",
  ResponseMessage: kSuccess,
  OofSettings: {
    __type: "UserOofSettings:#Exchange",
    OofState: "Scheduled",
    ExternalAudience: "Known",
    Duration: {
      __type: "Duration:#Exchange",
      StartTime: "2026-10-05T07:00:00",
      EndTime: "2026-10-19T16:00:00",
    },
    InternalReply: { __type: "ReplyBody:#Exchange", Message: "<html><body><p>Back on the <b>19th</b>.</p></body></html>" },
    ExternalReply: { __type: "ReplyBody:#Exchange", Message: "I am out of office." },
  },
  AllowExternalOof: "Known",
});

const kSetResponse = body({
  __type: "SetUserOofSettingsResponse:#Exchange",
  ResponseMessage: kSuccess,
});

test("Reads the settings from the server", async () => {
  let account = newAccount();
  response = kGetResponse;
  let autoResponder = account.autoResponder;
  await autoResponder.load();

  expect(calls.length).toBe(1);
  expect(calls[0].url).toBe("https://mail.example.com/owa/service.svc");
  expect(calls[0].action).toBe("GetUserOofSettings");
  expect(calls[0].body.__type).toBe("GetUserOofSettingsJsonRequest:#Exchange");
  expect(calls[0].body.Header.RequestServerVersion).toBe("Exchange2013");
  expect(calls[0].body.Body).toEqual({
    __type: "GetUserOofSettingsRequest:#Exchange",
    Mailbox: { __type: "EmailAddress:#Exchange", Address: "user1@example.com" },
  });

  expect(autoResponder.enabled).toBe(true);
  expect(autoResponder.scheduled).toBe(true);
  expect(autoResponder.startTime.toISOString()).toBe("2026-10-05T07:00:00.000Z");
  expect(autoResponder.endTime.toISOString()).toBe("2026-10-19T16:00:00.000Z");
  expect(autoResponder.externalAudience).toBe(AutoResponderAudience.Contacts);
  expect(autoResponder.maxAudience).toBe(AutoResponderAudience.Contacts);
  expect(autoResponder.internalHTML).toBe("sanitized:<html><body><p>Back on the <b>19th</b>.</p></body></html>");
  expect(autoResponder.externalHTML).toBe("converted:I am out of office.");
});

test("Old dates of a disabled responder are not kept", async () => {
  let account = newAccount();
  response = structuredClone(kGetResponse);
  response.Body.OofSettings.OofState = "Disabled";
  response.Body.OofSettings.Duration = { StartTime: "2006-10-05T07:00:00", EndTime: "2006-10-19T16:00:00" };
  let autoResponder = account.autoResponder;
  await autoResponder.load();

  expect(autoResponder.enabled).toBe(false);
  expect(autoResponder.scheduled).toBe(false);
  expect(autoResponder.startTime.getTime()).toBeGreaterThan(Date.now());
});

test("Writes the settings to the server", async () => {
  let account = newAccount();
  response = kSetResponse;
  let autoResponder = account.autoResponder;
  autoResponder.enabled = true;
  autoResponder.scheduled = true;
  autoResponder.startTime = new Date("2026-10-05T07:00:00Z");
  autoResponder.endTime = new Date("2026-10-19T16:00:00Z");
  autoResponder.externalAudience = AutoResponderAudience.All;
  autoResponder.internalHTML = "<p>Back on the <b>19th</b></p>";
  autoResponder.externalHTML = "<p></p>";
  await autoResponder.save();

  expect(calls[0].action).toBe("SetUserOofSettings");
  expect(calls[0].body.__type).toBe("SetUserOofSettingsJsonRequest:#Exchange");
  expect(calls[0].body.Body).toEqual({
    __type: "SetUserOofSettingsRequest:#Exchange",
    Mailbox: { __type: "EmailAddress:#Exchange", Address: "user1@example.com" },
    UserOofSettings: {
      __type: "UserOofSettings:#Exchange",
      OofState: "Scheduled",
      ExternalAudience: "All",
      Duration: {
        __type: "Duration:#Exchange",
        StartTime: "2026-10-05T07:00:00.000Z",
        EndTime: "2026-10-19T16:00:00.000Z",
      },
      InternalReply: { __type: "ReplyBody:#Exchange", Message: "<p>Back on the <b>19th</b></p>" },
      ExternalReply: { __type: "ReplyBody:#Exchange", Message: "" },
    },
  });
});

test("Without time range, there is no duration", async () => {
  let account = newAccount();
  response = kSetResponse;
  let autoResponder = account.autoResponder;
  autoResponder.enabled = true;
  autoResponder.scheduled = false;
  autoResponder.externalAudience = AutoResponderAudience.Contacts;
  await autoResponder.save();

  let settings = calls[0].body.Body.UserOofSettings;
  expect(settings.OofState).toBe("Enabled");
  expect(settings.ExternalAudience).toBe("Known");
  expect("Duration" in settings).toBe(false);

  autoResponder.enabled = false;
  await autoResponder.save();
  expect(calls[1].body.Body.UserOofSettings.OofState).toBe("Disabled");
});

test("An end before the start is refused", async () => {
  let account = newAccount();
  response = kSetResponse;
  let autoResponder = account.autoResponder;
  autoResponder.enabled = true;
  autoResponder.scheduled = true;
  autoResponder.endTime = new Date(autoResponder.startTime.getTime() - 1000);

  await expect(autoResponder.save()).rejects.toThrow();
  expect(calls.length).toBe(0);
});

test("A server error is shown", async () => {
  let account = newAccount();
  response = body({
    __type: "SetUserOofSettingsResponse:#Exchange",
    ResponseMessage: {
      ResponseClass: "Error",
      ResponseCode: "ErrorInvalidScheduledOofDuration",
      MessageText: "The specified time interval is invalid.",
    },
  });

  await expect(account.autoResponder.save()).rejects.toThrow("The specified time interval is invalid.");
});

test("Only for our own Exchange mailbox", () => {
  let account = newAccount();
  expect(account.autoResponder.supported).toBe(true);

  let shared = new OWAAccount();
  shared.initFromMainAccount(account);
  expect(shared.autoResponder.supported).toBe(false);
});

test("OWA and EWS send the same settings", () => {
  let owa = newAccount().autoResponder as any;
  let ews = new EWSAccount().autoResponder as any;
  for (let autoResponder of [owa, ews]) {
    autoResponder.enabled = true;
    autoResponder.scheduled = true;
    autoResponder.externalAudience = AutoResponderAudience.Contacts;
    autoResponder.internalHTML = "<p>Away</p>";
  }
  let withoutPrefix = (json: any) => JSON.parse(JSON.stringify(json).replaceAll('"t$', '"'));
  let withoutType = (json: any) => JSON.parse(JSON.stringify(json, (key, value) => key == "__type" ? undefined : value));
  expect(withoutType(owa.toOWA())).toEqual(withoutPrefix(ews.toEWS()));
});
