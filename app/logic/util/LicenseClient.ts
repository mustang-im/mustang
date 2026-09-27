/** All rights reserved. Proprietary code. Not Open Source. */

/* ***** ATTENTION CRACKERS *****
 *
 * Yes, it is all here, everything that you need to remove licenses.
 *
 * In case you are not aware, I have put much of my time into helping create
 * Thunderbird, Mustang, Parula, and lots of other Open-Source software,
 * and this is how I pay for my work and how I can live.
 * So how about a little favor: If you use your cleverness to use the software
 * for free for yourself, please don't use that to broadly "help"
 * the rest of the world with cracked versions, with scripts, or with
 * instructions how to bypass the license.
 * After all, I created this software with lots of work,
 * together with a whole team, and I made large parts of it Open-Source.
 * I didn't have to do that, but I wanted to share.
 *
 * But also I need to make a living, and so do all the other people
 * who work on this. So please don't bring everything down
 * by undermining our source of income.
 *
 * If you really want to help the cause of free software, since you were
 * clever enough to find this code, why don't you come join us and help
 * build better software?
 *
 * Hey, I'll even give you a *free* legitimate license, if you just help a
 * little with the product!
 *
 * Ben Bucksch
 * Original creator
 */

import { gLicense } from "./License";
import { appGlobal } from "../app";
import { siteRoot } from "../build";
import { Observable, notifyChangedProperty } from "./Observable";
import { RunOnce } from "./flow/RunOnce";
import { openExternalURL } from "./os-integration";
import type { URLString } from "./util";
import { k1MinuteMS, k1DayMS, k1WeekMS, k1MonthMS } from "../../frontend/Util/date";
import { logError } from "../../frontend/Util/error";
import { getUILocale, gt } from "../../l10n/l10n";
import { SetColl } from "svelte-collections";
import { Buffer } from "buffer";

const kLicenseServerURL = `https://api.beonex.com/parula-license/`;
// cat license.pem.pub, the part between "-----"
const kPublicKey = `MIIBI
jANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAxFMLzKJp3iEqjbnej/I8
JB9pPvYqFqxwa9MZkvuHwpDLf00mKq86KGvxhbRiGz944NXk8Fb6jKbcnr85CWHy
S/e4qc5MgfQMyJ51DkzTc5/tvEWzb8xjgbI3Qwr/emqmRgL3UtFSN+Za2Whwmp0I
IquA6unKhpdWDXY8uZHWy0N7ilqpo90bdHqB8NBrs22oeFqejnk/VOCSAOoizV6j
gWuDyHfr2GRiHb8iRPQlxTPg3zkR3nDjSp9JH7kwWwmDBrV4oC8rOCdkCAYW2ScB
y0sjmpvA6wc8/NnsJkZg9veeoCDmeC2qSWdZFon1SUHnGcUGVGvVJedhBblAgRjh
fQIDAQAB`;

export class License extends Observable {
  /** null = The user never had a license */
  @notifyChangedProperty
  expiresOn: Date | null = null;
  @notifyChangedProperty
  refreshOn: Date | null = null;
  /** The user bought or renewed the license while the app was running */
  @notifyChangedProperty
  paidJustNow = false;
  protected readonly fetchTicketOnce = new RunOnce<void>();
  protected paymentPoller: ReturnType<typeof setInterval> | null = null;
  protected trialRequested = false;
  protected publicKey: Promise<CryptoKey> | null = null;

  /** Negative numbers show the time since it expired.
   * @unit milliseconds */
  get expiresIn(): number {
    return (this.expiresOn?.getTime() ?? 0) - Date.now();
  }

  /** Full days until the license expires.
   * Negative numbers show the days since it expired. */
  get daysLeft(): number {
    return Math.floor(this.expiresIn / k1DayMS);
  }

  get valid(): boolean {
    return this.expiresIn > 0;
  }

  get isExpired(): boolean {
    return !!this.expiresOn && !this.valid;
  }

  get isSoonExpiring(): boolean {
    return this.valid && this.expiresIn < 2 * k1WeekMS;
  }

  get hasRecentlyExpired(): boolean {
    return this.isExpired && this.expiresIn > -k1MonthMS;
  }

  get requiresRefresh(): boolean {
    return this.valid && this.refreshOn?.getTime() < Date.now();
  }

  /**
   * Called for every server call, so it must be fast.
   *
   * @throws NoValidLicense
   */
  async ensureLicensed() {
    if (gLicense.license?.valid && !this.requiresRefresh) {
      return;
    }
    if (this.isExpired && !this.hasRecentlyExpired) {
      throw new NoValidLicense(); // We lost that user. Stop polling.
    }
    await this.fetchTicket();
    if (!this.valid) {
      throw new NoValidLicense();
    }
  }

  async isLicensed(): Promise<boolean> {
    try {
      await this.ensureLicensed();
      return true;
    } catch (ex) {
      return false;
    }
  }

  async startup() {
    gLicense.license = this; // Lets the Open-Source parts check whether this is a paid version
    await this.readSavedTicket();
    appGlobal.emailAccounts.subscribe(accounts => {
      if (accounts.hasItems) {
        this.poll().catch(logError);
      }
    });
    setInterval(() => this.poll().catch(logError), k1DayMS);
  }

  protected async poll() {
    if (this.isSoonExpiring || this.hasRecentlyExpired || this.requiresRefresh) {
      await this.fetchTicket();
    }
  }

  /** Downloads a new ticket from the server, or starts a trial */
  async fetchTicket() {
    await this.fetchTicketOnce.runOnce(async () => {
      let response = await this.callServer("ticket");
      if (response.ok) {
        await this.saveTicket(await response.json());
      } else if (response.status == 410) { // Gone
        // The server explicitly deletes the license, e.g. after a refund.
        // A specific error code, so that a server bug doesn't purge it.
        await this.saveTicket(null);
      }
      if (!this.valid) {
        await this.startTrial();
      }
    });
  }

  protected async startTrial() {
    if (this.trialRequested || this.savedTicket()) {
      return;
    }
    this.trialRequested = true;
    let response = await this.callServer("start-trial");
    if (!response.ok) {
      return;
    }
    await this.saveTicket(await response.json());

    let isFirstRun = !localStorage.getItem("firstRun");
    localStorage.setItem("firstRun", new Date().toISOString());
    if (isFirstRun) {
      this.openPurchasePage("welcome").catch(logError);
    }
  }

  protected async callServer(action: "ticket" | "start-trial"): Promise<Response> {
    let emailAddresses = new SetColl<string>();
    let name: string | null = null;
    for (let account of appGlobal.emailAccounts) {
      for (let identity of account.identities) {
        emailAddresses.add(identity.isCatchAll ? identity.emailAddress.replace("*", "any") : identity.emailAddress);
        name ??= identity.realname;
      }
    }
    if (emailAddresses.isEmpty) {
      throw new AccountMissingError();
    }
    let url = kLicenseServerURL + action + "/" + emailAddresses.first + "?" +
      new URLSearchParams({
        name: name ?? "",
        aliases: emailAddresses.contents.slice(1).join(","),
        tbversion: "100",
      });
    return await fetch(url, { cache: "reload" });
  }

  /** Manually add a ticket, e.g. from an email */
  async addTicket(signedTicketJSON: string) {
    await this.saveTicket(JSON.parse(signedTicketJSON));
    await this.ensureLicensed();
  }

  /** @throws if the signature is wrong */
  protected async saveTicket(signedTicket: SignedTicket | null) {
    let ticket = signedTicket ? await this.verifySignature(signedTicket) : null;
    localStorage.setItem("license", signedTicket ? JSON.stringify(signedTicket) : "");
    this.fromTicket(ticket);
  }

  protected async readSavedTicket() {
    let signedTicket = this.savedTicket();
    try {
      this.fromTicket(signedTicket ? await this.verifySignature(signedTicket) : null);
    } catch (ex) {
      ex.parameters = signedTicket;
      logError(ex);
      await this.saveTicket(null);
    }
  }

  savedTicket(): SignedTicket | null {
    let signedTicketJSON = localStorage.getItem("license");
    return signedTicketJSON ? JSON.parse(signedTicketJSON) : null;
  }

  protected fromTicket(ticket: Ticket | null) {
    this.expiresOn = ticket ? new Date(ticket.end) : null;
    this.refreshOn = ticket ? new Date(ticket.refresh) : null;
  }

  protected async verifySignature(signedTicket: SignedTicket): Promise<Ticket> {
    if (typeof signedTicket.json != "string" || typeof signedTicket.signature != "string") {
      throw new LicenseError("Required properties not found on ticket");
    }
    let algorithm = {
      name: "RSA-PSS",
      modulusLength: 1024,
      publicExponent: Uint8Array.from([1, 0, 1]),
      hash: { name: "SHA-256" },
      saltLength: 222,
    };
    this.publicKey ??= crypto.subtle.importKey("spki", Buffer.from(kPublicKey, "base64"), algorithm, false, ["verify"]);
    let signature = Buffer.from(signedTicket.signature, "hex");
    if (!await crypto.subtle.verify(algorithm, await this.publicKey, signature, new TextEncoder().encode(signedTicket.json))) {
      throw new LicenseError("Ticket signature verification failed");
    }
    return JSON.parse(signedTicket.json);
  }

  /** Opens our website in the browser, and waits for the purchase */
  async openPurchasePage(mode: "welcome" | "purchase" = "purchase") {
    await openExternalURL(License.purchasePageURL(mode));
    this.waitForPayment();
  }

  static purchasePageURL(mode: "welcome" | "purchase" | "inline-payment" = "purchase"): URLString {
    let params: Record<string, string> = {
      lang: getUILocale(),
      goal: mode,
    };
    let identity = appGlobal.emailAccounts.first?.identities.first;
    if (identity) {
      params.email = identity.emailAddress;
      params.name = identity.realname;
    }
    return siteRoot + "?" + new URLSearchParams(params) + "#purchase";
  }

  /** Polls the server for the new license, while the user is paying */
  waitForPayment() {
    this.stopWaitingForPayment();
    let oldExpiry = this.expiresOn?.getTime() ?? 0;
    let giveUp = Date.now() + 30 * k1MinuteMS;
    this.paymentPoller = setInterval(async () => {
      try {
        await this.fetchTicket();
        if (this.expiresOn?.getTime() > oldExpiry) {
          this.paidJustNow = true;
          this.stopWaitingForPayment();
        }
      } catch (ex) {
        logError(ex);
      }
      if (Date.now() > giveUp) {
        this.stopWaitingForPayment();
      }
    }, 10 * 1000);
  }

  stopWaitingForPayment() {
    clearInterval(this.paymentPoller);
    this.paymentPoller = null;
  }
}

export const license = new License();

license.startup() // Hack, to avoid that Open-Source code depends on this file
  .catch(logError);


export class LicenseError extends Error {
  doNotLog: boolean = true;
}
export class NoValidLicense extends LicenseError {
  message = gt`No valid software license for this professional feature`;
}
export class AccountMissingError extends LicenseError {
  message = gt`No account set up yet`;
}

interface SignedTicket {
  json: string;
  /** Hex */
  signature: string;
}

interface Ticket {
  end: string;
  refresh: string;
}
