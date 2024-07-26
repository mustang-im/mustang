import { net as Net, session as Session, BrowserWindow } from "electron";
import { Readable } from 'stream';

export async function fetchSessionData(partition: string, url: string, interactive: boolean) {
  let session = Session.fromPartition(partition);
  let response = await session.fetch(url + 'sessiondata.ashx', { method: 'POST' });
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
          response = await session.fetch(url + 'sessiondata.ashx', { method: 'POST' });
          finish(await response.json());
        } catch (ex) {
        }
      }
      let checkCanary = function(_event, cookie, _cause, removed) {
        if (!removed && cookie.name == 'X-OWA-CANARY') {
          checkLoginFinished();
        }
      };
      let checkLoaded = async function(_event) {
        let cookies = await Session.fromPartition(partition).cookies.get({ name: 'X-OWA-CANARY' });
        if (cookies[0]?.value) {
          checkLoginFinished();
        }
      };
      session.cookies.on('changed', checkCanary);
      popup.on('closed', function() { finish(null); });
      popup.webContents.on('did-stop-loading', checkLoaded);
      popup.loadURL(url);
    });
  }
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}`);
  }
  return await response.json();
}

/**
 * Fetches an HTTPS URL using a specific electron partition.
 * @param partition {string}
 * @param url       {string}
 * @param data?     {Dict<string>}
 *
 * TODO: Use options parameter, which can contain:
 * - body {Dict<string>|Buffer|string}
 * - cache {'default'|'no-store'|'reload'|'no-cache'|'force-cache'}
 * - credentials {'include'|'omit'|'same-origin'} [currently always 'include']
 * - headers {Dict<string>}
 * - method {string} [currently autodetects 'GET' or 'POST']
 * - origin {string}
 * - redirect {'follow'|'manual'|'error'} [currently always 'follow']
 * - result {'text'|'bytes'|'json'|'stream'} [currently always 'text']
 */
export async function fetchText(partition: string, url: string, data?: Dict<string>) {
  return new Promise((resolve, reject) => {
    let options = {
      method: data ? 'POST' : 'GET',
      url: url,
      partition: partition,
      credentials: 'include',
      redirect: 'manual',
    };
    let request = Net.request(options);
    request.on('response', message => {
      if ([101, 204, 205, 304].includes(message.statusCode)) {
        resolve({
          ok: (message.statusCode >= 200 && message.statusCode <= 299),
          status: message.statusCode,
          statusText: message.statusMessage,
          text: '',
          url: url,
        });
      } else {
        new Response(Readable.toWeb(message)).text().then(text => resolve({
          ok: (message.statusCode >= 200 && message.statusCode <= 299),
          status: message.statusCode,
          statusText: message.statusMessage,
          text: text,
          url: url,
        })).catch(reject);
      }
    });
    request.on('error', reject);
    request.on('redirect', (statusCode, method, redirectUrl, responseHeaders) => {
      url = redirectUrl;
      request.followRedirect();
    });
    request.end(data ? new URLSearchParams(data).toString() : '');
  });
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
