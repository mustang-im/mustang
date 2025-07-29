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
import { siteRoot } from "../build";
import { k1MinuteMS, k1DayMS, k1WeekMS, k1MonthMS } from "../../frontend/Util/date";
import { appGlobal } from "../app";
import { logError } from "../../frontend/Util/error";
import { getUILocale, gt } from "../../l10n/l10n";
import { SetColl } from "svelte-collections";

const kLicenseServerURL = `https://api.beonex.com/parula-license/`;
const kPublicKey = `data:application/octet-stream;base64,MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA6OOUqJLzc/q4b4Djfv091QCSA1QwS4scXQltt+WDSiiXI2DwyIA6bY4khJERDxrTdOQ+izx8SdVwwx7LQezRhnTi+Sls+sV7arkWiRz+13Y7LLApPvRZ1Db/nohue6lop3pjdAeudeVkWAViYdBQOv5A6U9uPl3Oki4CzJnHHiM8ojWVUte3HgyINzcIR4gdTH2aB4a97tUSq/sTbluQ2+7H4HLOjuUtaroIvR5Oq4tuAVKvhdO1UUi0JFXAbnOhljKWTsHdcsncB72pj3rUjrHyK8gViy6xDYycV81Rhq299QhQDmeX9zBAlr1YA2D72EzogxbS3gGUVnt05XR+rwIDAQAB`;

export class Ticket {
  /* The user currently has a valid license */
  valid: boolean = false;
  /** When this ticket expires */
  expiresOn: Date = new Date();
  /** Should re-fetch from server */
  requiresRefresh: boolean = false;

  /** How much time is left until this ticket expires.
   * Negative numbers show the time since it expired.
   * @unit milliseconds */
  get expiresIn(): number {
    return this.expiresOn.getTime() - Date.now();
  }

  /** How many full days until the license expires.
   * Negative numbers show the days since it expired.
   * @unit days */
  get daysLeft(): number {
    return Math.floor(this.expiresIn / k1DayMS);
  }

  get isExpired(): boolean {
    return this.valid && this.expiresIn < 0;
  }

  get isSoonExpiring(): boolean {
    const kSoonExpiring = 2 * k1WeekMS; // 2 weeks
    return this.valid && !this.isExpired && this.expiresIn < kSoonExpiring;
  }

  get hasRecentlyExpired(): boolean {
    const kRecentlyExpired = k1MonthMS; // 1 month
    return this.valid && this.isExpired && this.expiresIn > kRecentlyExpired;
  }
}

export class BadTicket extends Ticket {
  constructor() {
    super();
    this.valid = false;
  }
}

interface TicketFromServer {
  end: string;
  refresh: string;
}

interface SignedTicketFromServer {
  json: TicketFromServer;
  signature: string;
}

export class LicenseError extends Error {
  doNotLog: boolean = true;
}
export class NoValidLicense extends LicenseError {
  message = gt`No valid software license for this professional feature`;
}
export class AccountMissingError extends LicenseError {
  message = gt`No account set up yet`;
}

/**
 * Downloads a new license ticket if the poll interval has elasped.
 *
 * This is the public function that you should call from outside this module.
 * This is called for every server call, so it should be efficient.
 *
 * @throws If there is no valid license
 */
export async function ensureLicensed() {
  let ticket = gLicense.license as Ticket;
  if (ticket?.valid && !ticket.requiresRefresh) {
    return;
  }
  ticket = await checkSavedLicense();
  /* Allows the Open-Source parts - e.g. email signatures - to check whether
   * this is a paid version.
   * Also a cache, to avoid re-validating the ticket cryptographically for every server call. */
  gLicense.license = ticket;
  if (ticket?.valid && !ticket.requiresRefresh) {
    return;
  }
  if (ticket.isExpired && !ticket.hasRecentlyExpired) {
    // We lost that user. Stop polling.
    throw new NoValidLicense();
  }
  ticket = await fetchTicket();
  if (!ticket?.valid) {
    throw new NoValidLicense();
  }
}

export async function isLicensed(): Promise<boolean> {
  try {
    await ensureLicensed();
    return true;
  } catch (ex) {
    return false;
  }
}

/** Whether we started the poller that refreshes the license */
let gPolling: boolean = false;

/**
 * Polls for a new ticket, in case the ticket is expired or expiring soon,
 * and on startup
 */
async function nextPoll() {
  if (gPolling) {
    return;
  }
  gPolling = true;
  try {
    let ticket = await checkSavedLicense();
    if (ticket.isSoonExpiring || ticket.hasRecentlyExpired || ticket.requiresRefresh) {
      await fetchTicket();
    }
    gLicense.license = ticket;
  } catch (ex) {
    logError(ex);
  }
}

export async function fetchLicenseFromServer(): Promise<Ticket> {
  return fetchTicket();
}

/** A promise that resolves when a ticket refresh finishes */
let gFetchingTicket: Promise<Ticket> | null = null;

/**
 * Downloads a new license ticket, but avoids downloading twice in parallel.
 */
async function fetchTicket(): Promise<Ticket> {
  if (!gFetchingTicket) {
    gFetchingTicket = fetchTicketUnqueued();
  }
  // TODO check for races
  let ticket = await gFetchingTicket;
  gFetchingTicket = null;
  return ticket;
}

/**
 * Downloads a new license ticket.
 */
async function fetchTicketUnqueued(): Promise<Ticket> {
  let name: string | null = null;
  let emailAddresses = new SetColl<string>();
  for (let account of appGlobal.emailAccounts) {
    for (let identity of account.identities) {
      let emailAddress = identity.emailAddress;
      if (identity.isCatchAll) {
        emailAddress = emailAddress.replace("*", "any");
      }
      emailAddresses.add(emailAddress);
      name ??= identity.realname;
    }
  }
  if (emailAddresses.isEmpty) {
    throw new AccountMissingError();
  }

  let url = kLicenseServerURL + "ticket/" + emailAddresses.first + "?" +
    new URLSearchParams({
      name: name ?? "",
      aliases: emailAddresses.contents.slice(1).join(","),
      tbversion: "100",
    });
  let response = await fetch(url, { cache: "reload" });
  if (response.ok) {
    let signedTicket = await response.json();
    saveTicket(signedTicket);
  } else if (response.status == 410) { // Gone
    // Server explicitly deletes the license/ticket, e.g. after a refund.
    // (We use a specific error code for this, because we don't want
    // this purge to happen accidentally, even after a server bug.)
    saveTicket(null);
  }
  let ticket = await checkSavedLicense();
  if (!ticket?.valid) {
    await startTrial(emailAddresses.contents, name);
    ticket = await checkSavedLicense();
  }
  return ticket;
}

/** Whether this user is known to have had a trial license */
let gHadTrial = false;

async function startTrial(emailAddresses: string[], name: string) {
  if (gHadTrial) {
    return;
  }
  gHadTrial = true; // avoid firing several server calls in parallel
  if (getSavedTicket()) {
    // already had a trial
    return;
  }

  let url = kLicenseServerURL + "start-trial/" + emailAddresses[0] + "?" +
    new URLSearchParams({
      name: name,
      aliases: emailAddresses.slice(1).join(","),
      tbversion: "100",
    });
  let response = await fetch(url);
  if (!response.ok) {
    return;
  }
  let signedTicket = await response.json();
  saveTicket(signedTicket);

  if (isFirstRun()) {
    openPurchasePage(null, "welcome");
  }
}

/**
 * Manually add a ticket from an email.
 */
export async function addTicketFromString(signedTicketStr: string) {
  let signedTicket = JSON.parse(signedTicketStr);
  await verifyTicketSignature(signedTicket);
  saveTicket(signedTicket);
  await ensureLicensed();
}

/**
 * Checks the saved ticket to see whether it is valid.
 */
export async function checkSavedLicense(): Promise<Ticket> {
  let signedTicket = getSavedTicket();
  if (!signedTicket) {
    return new BadTicket();
  }
  let ticketJSON: TicketFromServer;
  try {
    ticketJSON = await verifyTicketSignature(signedTicket);
  } catch (ex) {
    ex.parameters = signedTicket;
    logError(ex);
    saveTicket(null);
    return new BadTicket();
  }
  let ticket = new Ticket();
  let end = Date.parse(ticketJSON.end);
  let refresh = Date.parse(ticketJSON.refresh);
  ticket.expiresOn = new Date(end);
  ticket.valid = !ticket.isExpired;
  ticket.requiresRefresh = ticket.valid && refresh < Date.now(); // ticket expired. poll on every call.
  return ticket;
}

/** The crypto key for verifying ticket signatures */
let gKeyPromise: Promise<CryptoKey> | null = null;

/**
 * Verify a ticket.
 *
 * @param signedTicket  The JSON encoded ticket to verify
 * @returns       The decoded JSON
 * @throws        If the ticket is invalid
 * */
async function verifyTicketSignature(signedTicket: SignedTicketFromServer): Promise<TicketFromServer> {
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
  if (!gKeyPromise) {
    let response = await fetch(kPublicKey);
    let keyArrayBuffer = await response.arrayBuffer();
    gKeyPromise = crypto.subtle.importKey("spki", keyArrayBuffer, algorithm, false, ["verify"]);
  }
  let key = await gKeyPromise;
  let signatureArrayBuffer = new Uint8Array(signedTicket.signature.length / 2);
  for (let i = 0; i < signatureArrayBuffer.length; i++) {
    signatureArrayBuffer[i] = parseInt(signedTicket.signature.substring(i * 2, i * 2 + 2), 16);
  }
  if (!await crypto.subtle.verify(algorithm, key, signatureArrayBuffer, (new TextEncoder).encode(signedTicket.json))) {
    throw new LicenseError("Ticket signature verification failed");
  }
  return JSON.parse(signedTicket.json);
}

/** Read ticket from local settings */
function getSavedTicket(): SignedTicketFromServer | null {
  let signedTicketStr = localStorage.getItem("license");
  if (!signedTicketStr) {
    return null;
  }
  return JSON.parse(signedTicketStr);
}

/** Save ticket from local settings */
function saveTicket(ticket: SignedTicketFromServer | null) {
  localStorage.setItem("license", ticket ? JSON.stringify(ticket) : "");
}

/** This is the first time ever that the user starts the app
 * (or we run this function */
function isFirstRun(): boolean {
  let isFirstRun = !localStorage.getItem("firstRun");
  localStorage.setItem("firstRun", new Date().toISOString());
  return isFirstRun;
}

const kGetLicenseURL = siteRoot;

/** Called from [Bug] button in license bar and in settings page,
 * and on first run */
export async function openPurchasePage(paidCallback?: (license: Ticket) => void, mode: "welcome" | "purchase" = "purchase") {
  let primaryIdentity = appGlobal.emailAccounts.first?.identities.first;
  let pageURL = kGetLicenseURL + "?" + new URLSearchParams({
    email: primaryIdentity.emailAddress,
    name: primaryIdentity.realname,
    lang: getUILocale(),
    goal: mode,
  }) + "#" + mode;
  console.log("Opening payment page in browser", pageURL);
  await appGlobal.remoteApp.openExternalURL(pageURL);
  startPolling(paidCallback);
}

/** How often to poll after the user clicked [Buy] */
const kPurchasePollInterval = 10 * 1000; // 10 seconds
/** For how long to poll after the user clicked [Buy] */
const kPurchasePollFor = 30 * k1MinuteMS; // 30 minutes
let purchasePoller: NodeJS.Timeout | null = null;

function startPolling(paidCallback?: (license: Ticket) => void) {
  stopPurchasePolling();
  purchasePoller = setInterval(async () => {
    try {
      let ticket = await fetchTicket();
      if (ticket.valid && paidCallback) {
        stopPurchasePolling();
        paidCallback(ticket);
        paidCallback = null;
      }
    } catch (ex) {
      logError(ex);
    }
  }, kPurchasePollInterval);

  setTimeout(() => stopPurchasePolling, kPurchasePollFor);
}

function stopPurchasePolling() {
  if (purchasePoller) {
    clearInterval(purchasePoller);
  }
  purchasePoller = null;
}

export function startup() {
  nextPoll();
  const kSoonExpiringPollInterval = k1DayMS; // 1 day
  setInterval(nextPoll, kSoonExpiringPollInterval);
}
startup(); // Hack, to avoid that Open-Source code depends on this file
