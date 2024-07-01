import { session as Session, BrowserWindow } from "electron";

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
        webPreferences: { session },
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

export async function fetchJSON(partition: string, url: string, request: any) {
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
  let action = request.__type.slice(0, -21);
  let options = {
    method: "POST",
    headers: {
      Action: action,
      "Content-Type": "application/json",
      "X-OWA-CANARY": cookies[0].value,
    },
    body: JSON.stringify(request),
  };
  let response = await session.fetch(url, options);
  result.ok = response.ok;
  result.status = response.status;
  result.statusText = response.statusText;
  result.url = response.url;
  result.contentType = response.headers.get('Content-Type');
  result.json = await response.json();
  return result;
}

export async function clearStorageData(partition: string) {
  await Session.fromPartition(partition).clearStorageData();
}
