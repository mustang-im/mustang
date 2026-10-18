// app first, to resolve the import cycle around Abstract/Account.ts
import { appGlobal } from "../../../../logic/app";
import { JMAPAccount } from "../../../../logic/Mail/JMAP/JMAPAccount";
import { JMAPCalendar } from "../../../../logic/Calendar/JMAP/JMAPCalendar";
import { Participant } from "../../../../logic/Calendar/Participant";
import { InvitationResponse } from "../../../../logic/Calendar/Invitation/InvitationStatus";
import { beforeAll, expect, test } from "vitest";

beforeAll(() => {
  appGlobal.remoteApp ??= {
    kyCreate: () => { throw new Error("The test should not talk to a real server"); },
  } as any;
});

const kBob = "calendar-bob@example.com";
const kCarol = "calendar-carol@example.com";
const kExternal = "someone@example.net";

/** Alice's account. The server answers like Stalwart: Bob gave Alice his free/busy times,
 * Carol refuses, the external address is no principal. */
function setup(availabilityCapability = true) {
  let account = new JMAPAccount();
  account.accountID = "u";
  account.session = {
    capabilities: {
      "urn:ietf:params:jmap:core": {},
      "urn:ietf:params:jmap:principals": {},
      ...(availabilityCapability ? { "urn:ietf:params:jmap:principals:availability": {} } : {}),
    },
    accounts: { u: { name: "calendar-alice@example.com", isPersonal: true, isReadOnly: false, accountCapabilities: {} } },
    primaryAccounts: { "urn:ietf:params:jmap:principals": "u", "urn:ietf:params:jmap:calendars": "u" },
  } as any;
  let principals: Record<string, any> = {
    [kBob]: { id: "v", type: "individual", name: kBob, description: "calendar-bob", email: kBob },
    [kCarol]: { id: "w", type: "individual", name: kCarol, description: "calendar-carol", email: kCarol },
  };
  let calls: any[] = [];
  account.makeCombinedCall = async (methodCalls: [string, Record<string, any>, string?][]) => {
    let email = methodCalls[0][1].filter.email;
    let principal = principals[email];
    return {
      query: { accountId: "u", queryState: "n", canCalculateChanges: true, position: 0, ids: principal ? [principal.id] : [] },
      principals: { accountId: "u", state: "n", list: principal ? [principal] : [], notFound: [] },
    };
  };
  account.makeSingleCall = async (method: string, args: any) => {
    calls.push([method, args]);
    expect(method).toBe("Principal/getAvailability");
    if (args.id == "w") {
      throw Object.assign(new Error("forbidden"), { code: "forbidden" });
    }
    return {
      list: [
        { utcStart: "2026-11-11T14:00:00Z", utcEnd: "2026-11-11T15:00:00Z", busyStatus: "confirmed", event: null },
        { utcStart: "2026-11-12T09:00:00Z", utcEnd: "2026-11-12T10:00:00Z", busyStatus: "tentative", event: null },
      ],
    };
  };
  let calendar = new JMAPCalendar();
  calendar.initFromMainAccount(account);
  calendar.jmapID = "b";
  return { calendar, calls };
}

const kParticipants = [kBob, kCarol, kExternal].map(email => new Participant(email, null, InvitationResponse.NoResponseReceived));

test("The busy times of the participants are read from the server", async () => {
  let { calendar, calls } = setup();

  let result = await calendar.arePersonsFree(kParticipants, new Date("2026-11-09T00:00:00Z"), new Date("2026-11-14T00:00:00Z"));

  expect(calls[0][1]).toMatchObject({ accountId: "u", id: "v", utcStart: "2026-11-09T00:00:00Z", utcEnd: "2026-11-14T00:00:00Z", showDetails: false });
  expect(result.map(r => r.participant.emailAddress)).toEqual([kBob, kCarol, kExternal]);
  expect(result[0].availability.map(a => [a.from.toISOString(), a.to.toISOString(), a.free])).toEqual([
    ["2026-11-11T14:00:00.000Z", "2026-11-11T15:00:00.000Z", false],
    ["2026-11-12T09:00:00.000Z", "2026-11-12T10:00:00.000Z", false],
  ]);
  // Unknown, not free
  expect(result[1].availability).toBeUndefined();
  expect(result[2].availability).toBeUndefined();
});

test("A server without availability tells nothing", async () => {
  let { calendar, calls } = setup(false);

  let result = await calendar.arePersonsFree(kParticipants, new Date("2026-11-09T00:00:00Z"), new Date("2026-11-14T00:00:00Z"));

  expect(result).toEqual([]);
  expect(calls).toEqual([]);
});
