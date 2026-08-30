// app first, to resolve the import cycle around Abstract/Account.ts
import { appGlobal } from "../../../logic/app";
import { Account } from "../../../logic/Abstract/Account";
import { Calendar } from "../../../logic/Calendar/Calendar";
import { sleep } from "../../../logic/util/util";
import { expect, test } from "vitest";

test("Starting the dependent accounts again does not start them twice", async () => {
  let mainAccount = new TestAccount();
  let calendar = new TestCalendar();
  calendar.mainAccount = mainAccount;
  appGlobal.calendars.add(calendar);
  try {
    await mainAccount.startDependents();
    await mainAccount.startDependents(); // e.g. logged in again
    expect(calendar.startupCount).toBe(1);

    calendar.finishStartup();
    await sleep(0);
    await mainAccount.startDependents();
    expect(calendar.startupCount).toBe(2);
  } finally {
    calendar.finishStartup();
    appGlobal.calendars.remove(calendar);
  }
});

class TestAccount extends Account {
  async startDependents() {
    await this.startupDependentAccounts();
  }
}

/** Its startup runs until `finishStartup()` is called */
class TestCalendar extends Calendar {
  startupCount = 0;
  finishStartup: () => void = () => undefined;

  async startup() {
    this.startupCount++;
    await new Promise<void>(resolve => this.finishStartup = resolve);
  }
}
