import { session as Session, BrowserWindow } from "electron";

const kCookieName = "X-OWA-CANARY";
const kHotmailServer = "outlook.live.com";

export async function fetchSessionData(partition: string, url: string, interactive: boolean) {
  let session = Session.fromPartition(partition);
  let response = await session.fetch(url + 'sessiondata.ashx', { method: 'POST' });
  let urlObj = new URL(url);
  if ([401, 440].includes(response.status) && interactive) {
    return await new Promise(resolve => {
      let popup = new BrowserWindow({
        //parent: mainWindow,
        //modal: true,
        center: true,
        autoHideMenuBar: true,
        webPreferences: {
          session,
          // Security
          sandbox: true,
          disableHtmlFullscreenWindowResize: true,
          webgl: false,
          autoplayPolicy: "user-gesture-required",
        },
      });
      let finished = false;
      let finish = function(data) {
        if (finished) {
          return;
        }
        finished = true;
        session.cookies.removeListener('changed', checkCanary);
        resolve(data);
        if (!popup.isDestroyed()) {
          popup.destroy();
        }
      };
      let checkLoginFinished = async function() {
        try {
          response = await session.fetch(urlObj.toString() + 'sessiondata.ashx', { method: 'POST' });
          finish(await response.json());
        } catch (ex) {
        }
      }
      let checkCanary = async function(_event, cookie, _cause, removed) {
        // For Hotmail, check the path to the CANARY cookie.
        if (cookie.domain == kHotmailServer &&
          cookie.name == kCookieName &&
          cookie.path?.startsWith("/owa/")) {
        // Hotmail also sets cookies for /owa/0/, /mail/0/, /calendar/0/ etc.,
        // but we can use only the /owa/0/ cookie.
        // We also need to use that URL for the service request.
        // This needs to happen before CheckLoginFinished().
          urlObj.hostname = cookie.domain;
          urlObj.pathname = cookie.path;
        }
        if (!removed &&
          cookie.name == kCookieName &&
          cookie.domain == urlObj.hostname
        ) {
          await checkLoginFinished();
        }
      };
      let checkLoaded = async function(_event) {
        let cookies = await Session.fromPartition(partition).cookies.get({ name: kCookieName });
        if (cookies[0]?.value) {
          checkLoginFinished();
        }
      };
      session.cookies.on('changed', checkCanary);
      popup.on('closed', function() { finish(null); });
      popup.webContents.on('did-stop-loading', checkLoaded);
      popup.loadURL(url.toString());
    });
  }
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}`);
  }
  return await response.json();
}

export async function fetchJSON(partition: string, url: string, action: string, request: any) {
  let result = {
    ok: false,
    status: 0,
    statusText: '',
    url: '',
    contentType: '',
    json: null,
  };
  let session = Session.fromPartition(partition);
  let cookies = await session.cookies.get({ name: 'X-OWA-CANARY' });
  if (!cookies.length) {
    result.status = 401;
    return result;
  }
  let options = {
    method: "POST",
    headers: {
      "X-OWA-CANARY": cookies[0].value,
    },
  };
  if (action) {
    options.headers.Action = action;
  }
  if (request) {
    options.headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(request);
  }
  let response = await session.fetch(url, options);
  result.ok = response.ok;
  result.status = response.status;
  result.statusText = response.statusText;
  result.url = response.url;
  result.contentType = response.headers.get('Content-Type');
  result.json = await response.json();
  return result;
}

export async function streamJSON(partition: string, url: string) {
  let result = {
    ok: false,
    status: 0,
    statusText: '',
    body: null,
  };
  let session = Session.fromPartition(partition);
  let cookies = await session.cookies.get({ name: 'X-OWA-CANARY' });
  if (!cookies.length) {
    result.status = 401;
    return result;
  }
  let response = await session.fetch(url + cookies[0].value);
  result.ok = response.ok;
  result.status = response.status;
  result.statusText = response.statusText;
  result.body = response.body.pipeThrough(new TextDecoderStream());
  return result;
}

export async function clearStorageData(partition: string) {
  await Session.fromPartition(partition).clearStorageData();
}
