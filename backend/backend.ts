import JPCWebSocket from '../lib/jpc-ws';
import { ImapFlow } from 'imapflow';
import { Database } from "@radically-straightforward/sqlite";
import nodemailer from 'nodemailer';
import path from "node:path";
import os from "node:os";
import fs from "node:fs";

export async function startupBackend() {
  let appGlobal = await createSharedAppObject();
  let jpc = new JPCWebSocket(appGlobal);
  await jpc.listen(kSecret, 5455, false);
}

const kSecret = 'eyache5C'; // TODO generate, and communicate to client, or save in config files.

async function createSharedAppObject() {
  return {
    createIMAPFlowConnection,
    getSQLiteDatabase,
    sendMailNodemailer,
    verifyServerNodemailer,
  };
}

function createIMAPFlowConnection(...args): ImapFlow {
  return new ImapFlow(...args);
}

function getSQLiteDatabase(filename: string): Database {
  return new Database(path.join(getConfigDir(), filename));
}

async function sendMailNodemailer(transport, mail) {
  let transporter = nodemailer.createTransport(transport);
  await transporter.sendMail(mail);
}

async function verifyServerNodemailer(transport) {
  let transporter = nodemailer.createTransport(transport);
  await transporter.verify();
}

const kAppConfigDir = "Mustang";
/**
 * Get the user config directory on disk.
 * Linux: /home/USER/.mustang/
 * Windows: C:\Users\USER\AppData\Mustang\
 */
function getConfigDir(): string {
  let dirname = os.platform() == "win32" || os.platform() == "darwin" ? kAppConfigDir : "." + kAppConfigDir.toLowerCase();
  let dir = path.join(os.homedir(), dirname);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}
