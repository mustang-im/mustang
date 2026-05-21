import { appGlobal } from './app';
import { readMailAccounts } from './Mail/AccountsList/MailAccounts';
import { readChatAccounts } from './Chat/AccountsList/ChatAccounts';
import { readAddressbooks } from './Contacts/AccountsList/Addressbooks';
import { readCalendars } from './Calendar/AccountsList/Calendars';
import { readMeetAccounts } from './Meet/AccountsList/MeetAccounts';
import { readFileSharingAccounts } from './Files/AccountsList/FileSharingAccounts';
import { readTopicAccounts } from './Topic/TopicAccounts';
import { readSavedSearches } from './Mail/Virtual/SavedSearchFolder';
import { loadWorkspaces } from './Abstract/Workspace';
import { loadTagsList } from './Abstract/Tag';
import { type Account, getAllAccounts, setMainAccounts } from './Abstract/Account';
import JPCWebSocket from '../../lib/jpc-ws';
import { production, webMail } from './build';
import { logError } from '../frontend/Util/error';
import { assert } from './util/util';

/** Read before svelte-navigator `<Router>` mounts and rewrites `location.hash` */
let jpcSecretFromURL = new URLSearchParams(location.hash.slice(1)).get("jpcSecret");

/**
 * Desktop (Electron): the main process puts the per-process JPC secret in
 *   the URL fragment when it loads the renderer; we capture it above at
 *   module-load time so the router doesn't get a chance to clobber it.
 * Mobile (Capacitor): the Node.js process generated the secret. The web
 *   view asks for it over Capacitor's IPC bridge (separate from the
 *   WebSocket we use for everything else). We reach for the plugin via
 *   the runtime-registered `Capacitor.Plugins.NodeJS` rather than
 *   importing `capacitor-nodejs` — keeps app/ free of mobile-only deps.
 */
async function getJPCSecret(): Promise<string> {
  // #if [MOBILE]
  const NodeJS = (globalThis as any).Capacitor?.Plugins?.NodeJS;
  await NodeJS.whenReady();
  return await new Promise<string>(async (resolve) => {
    const listener = await NodeJS.addListener('jpc:secret', (event: any) => {
      listener.remove();
      resolve(event.args[0]);
    });
    await NodeJS.send({ eventName: 'jpc:get-secret' });
  });
  // #else
  if (webMail) {
    return "";
  }
  assert(jpcSecretFromURL, "No JPC secret was passed in the frontend URL");
  return jpcSecretFromURL;
  // #endif
}

export async function getStartObjects(): Promise<void> {
  const secret = await getJPCSecret();
  let jpc = new JPCWebSocket(null);
  await jpc.connect(secret, "localhost", production ? 5455 : 5453);
  console.log("Connected to backend");
  appGlobal.remoteApp = await jpc.getRemoteStartObject();
  await loadWorkspaces();
  appGlobal.emailAccounts.addAll(await readMailAccounts());
  appGlobal.chatAccounts.addAll(await readChatAccounts());
  appGlobal.meetAccounts.addAll(await readMeetAccounts());
  appGlobal.fileSharingAccounts.addAll(await readFileSharingAccounts());
  appGlobal.addressbooks.addAll(await readAddressbooks());
  appGlobal.calendars.addAll(await readCalendars());
  appGlobal.topicAccounts.addAll(await readTopicAccounts());
  setMainAccounts();

  // TODO Save the address book type and ensure that they are of the right type
  appGlobal.personalAddressbook = appGlobal.addressbooks.first;
  appGlobal.collectedAddressbook = appGlobal.addressbooks.get(1);
  readSavedSearches();
  await loadTagsList();
}

/**
 * Logs in to all accounts for which we have the credentials stored.
 *
 * @param startupErrorCallback Called for login errors.
 *   May be called multiple times, e.g. once per account.
 */
export function loginOnStartup(startupErrorCallback: (ex: Error) => void): void {
  let allAccounts = getAllAccounts();
  for (let account of allAccounts) {
    account.errorCallback = (ex) => backgroundErrorInAccount(ex, account);
  }
  for (let account of allAccounts) {
    if (account.loginOnStartup && !account.isDependentAccount) {
      (async () => {
        if (!account.isLoggedIn) {
          await account.login(false);
        }
        await account.startup();
      })().catch(errorWithAccountName(account, startupErrorCallback));
    }
  }
}

function errorWithAccountName(account: Account, errorCallback: (ex: Error) => void) {
  return (ex: Error) => {
    account.errors.add(ex);
    if (ex?.message) {
      ex.message = `${account.name}: ${ex.message}`;
    }
    errorCallback(ex);
  };
}

function backgroundErrorInAccount(ex: Error, account: Account) {
  account.errors.add(ex);
  if (ex?.message) {
    ex.message = `${account.name}: ${ex.message}`;
  }
  logError(ex);
}
