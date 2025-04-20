/** All rights reserved. Proprietary code. Not Open Source. */

/* ***** ATTENTION CRACKERS *****
 *
 * Yes, it is all here, everything that you need to remove licenses.
 *
 * In case you are not aware, I have put much of my time into helping create
 * Thunderbird, Parula, and lots of other Open-Source software,
 * and this is how I pay for my work and how I can live.
 * So how about a little favor. If you use your cleverness to use the software
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
 * little with the core product!
 *
 * Ben Bucksch
 * Original creator
 */

import { production, siteRoot } from "../build";
import { getUILocale, gt } from "../../l10n/l10n";
import { appGlobal } from "../app";
import { logError } from "../../frontend/Util/error";
import { gLicense } from "./License";

const kSoonExpiringPollInterval = 24 * 60 * 60 * 1000; // 1 day
const kSoonExpiring = 14 * 24 * 60 * 60 * 1000; // 2 weeks
const kOld = -14 * 24 * 60 * 60 * 1000; // 2 weeks ago

const kGetLicenseURL = `${siteRoot}/?`;
const kLicenseServerURL = `https://api.beonex.com/parula-license/`;
const kPublicKey = `data:application/octet-stream;base64,MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA6OOUqJLzc/q4b4Djfv091QCSA1QwS4scXQltt+WDSiiXI2DwyIA6bY4khJERDxrTdOQ+izx8SdVwwx7LQezRhnTi+Sls+sV7arkWiRz+13Y7LLApPvRZ1Db/nohue6lop3pjdAeudeVkWAViYdBQOv5A6U9uPl3Oki4CzJnHHiM8ojWVUte3HgyINzcIR4gdTH2aB4a97tUSq/sTbluQ2+7H4HLOjuUtaroIvR5Oq4tuAVKvhdO1UUi0JFXAbnOhljKWTsHdcsncB72pj3rUjrHyK8gViy6xDYycV81Rhq299QhQDmeX9zBAlr1YA2D72EzogxbS3gGUVnt05XR+rwIDAQAB`;

class Ticket {
  valid: boolean = false;
  status: string = "missing";
  expiredIn: number = 0;
  requiresRefresh: boolean = false;
}

class BadTicket extends Ticket {
  constructor(status: string = "missing") {
    super();
    this.status = status;
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
  ticket = await checkLicense();
  /* Allows the Open-Source parts - e.g. email signatures - to check whether
   * this is a paid version.
   * Also a cache, to avoid re-validating the ticket cryptographically for every server call. */
  gLicense.license = ticket;
  if (ticket?.valid && !ticket.requiresRefresh) {
    return;
  }
  if (ticket.expiredIn < kOld) {
    // We lost that user. Stop polling.
    throw new NoValidLicense();
  }
  ticket = await fetchTicket();
  if (!ticket?.valid) {
    throw new NoValidLicense();
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
    let ticket = await checkLicense();
    if (ticket.status != "normal" && ticket.requiresRefresh) {
      await fetchTicket();
    }
    gLicense.license = ticket;
  } catch (ex) {
    logError(ex);
  }
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
  let emailAddresses: string[] = [];
  for (let account of appGlobal.emailAccounts) {
    for (let identity of account.identities) {
      let emailAddress = identity.emailAddress;
      if (identity.isCatchAll) {
        emailAddress = emailAddress.replace("*", "any");
      }
      emailAddresses.push(emailAddress);
      if (!name) {
        name = identity.realname;
      }
    }
  }
  if (!emailAddresses.length || !name) {
    throw new AccountMissingError();
  }
  let email = emailAddresses[0];

  let url = kLicenseServerURL + "ticket/" + email + "?" +
    new URLSearchParams({
      name: name,
      aliases: emailAddresses.slice(1).join(","),
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
  let ticket = await checkLicense();
  if (!ticket?.valid) {
    await startTrial(emailAddresses, name);
    ticket = await checkLicense();
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
    openPurchasePage("welcome");
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
async function checkLicense(): Promise<Ticket> {
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
  ticket.expiredIn = end - Date.now();
  ticket.valid = ticket.expiredIn > 0;
  ticket.requiresRefresh = ticket.valid && refresh < Date.now(); // ticket expired. poll on every call.
  if (!ticket.valid) {
    ticket.status = "expired";
  } else if (ticket.expiredIn > kSoonExpiring) {
    ticket.status = "normal";
  } else {
    ticket.status = "expiring";
  }
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

/** How often to poll after the user clicked [Purchase] */
const kPurchasePollInterval = 10 * 1000; // 10 seconds
/** For how long to poll after the user clicked [Purchase] */
const kPurchasePollFor = 30 * 60 * 1000; // 30 minutes

/** Called from [Purchase] button in license bar and in settings page */
async function openPurchasePage(mode: "welcome" | "purchase" = "purchase") {
  let primaryIdentity = appGlobal.emailAccounts.first?.identities.first;
  let pageURL = kGetLicenseURL + new URLSearchParams({
    email: primaryIdentity.emailAddress,
    name: primaryIdentity.realname,
    lang: getUILocale(),
    goal: mode,
  }) + "#" + mode;
  await appGlobal.remoteApp.openLink(pageURL);

  let purchasePoller = setInterval(async () => {
    try {
      await fetchTicket();
    } catch (ex) {
      logError(ex);
    }
  }, kPurchasePollInterval);
  setTimeout(() => {
    clearInterval(purchasePoller);
  }, kPurchasePollFor);
}

export function startup() {
  nextPoll();
  setInterval(nextPoll, kSoonExpiringPollInterval);
}
startup(); // Hack, to avoid that Open-Source code depends on this file
