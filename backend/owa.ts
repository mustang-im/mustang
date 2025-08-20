import { session as Session, BrowserWindow, net as Net } from "electron";
import { Readable } from 'stream';

const kCanaryName = "X-OWA-CANARY";
const kHotmailServer = "outlook.live.com";

export async function fetchJSON(partition: string, url: string, options: any, bodyJSON: any) {
  let result = {
    ok: false,
    status: 0,
    statusText: '',
    url: '',
    contentType: '',
    json: null,
  };
  let session = Session.fromPartition(partition);
  let cookies = await session.cookies.get({ name: kCanaryName });
  if (!cookies.length) {
    result.status = 401;
    return result;
  }
  options ??= {};
  options.method ??= "POST";
  options.headers ??= {};
  options.headers[kCanaryName] = cookies[0].value;
  if (bodyJSON) {
    options.headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(bodyJSON);
  }
  let response = await session.fetch(url, options);
  result.ok = response.ok;
  result.status = response.status;
  result.statusText = response.statusText;
  result.url = response.url;
  result.contentType = response.headers.get('Content-Type');
  result.text = await response.text();
  try {
    result.json = JSON.parse(result.text);
  } catch (ex) {
    result.ok = false;
    result.statusText = ex.message;
  }
  return result;
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
  //console.log("fetchText partition", partition, "URL", url, "Data", data);
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

export async function streamJSON(partition: string, url: string) {
  let result = {
    ok: false,
    status: 0,
    statusText: '',
    body: null,
  };
  let session = Session.fromPartition(partition);
  let cookies = await session.cookies.get({ name: kCanaryName });
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

export async function streamEvents(partition: string, url: string, options: any) {
  let result = {
    ok: false,
    status: 0,
    statusText: '',
    body: null,
  };
  let session = Session.fromPartition(partition);
  let response = await session.fetch(url, options);
  result.ok = response.ok;
  result.status = response.status;
  result.statusText = response.statusText;
  result.body = response.body.pipeThrough(new TextDecoderStream()).pipeThrough(new TransformStream(new EventDecoder()));
  return result;
}

export async function clearStorageData(partition: string) {
  await Session.fromPartition(partition).clearStorageData();
}

function newEvent() {
  return {
    name: 'message',
    data: '',
    id: '',
    retry: 0,
  };
}

class EventDecoder {
  data = '';
  event = newEvent();
  transform(chunk, controller) {
    this.data += chunk;
    let lines = this.data.split(/\r\n?|\n/);
    this.data = lines.pop();
    for (let line of lines) {
      if (!line) {
        this.event.data = this.event.data.slice(0, -1);
        controller.enqueue(this.event);
        this.event = newEvent();
        continue;
      }
      let value = '';
      let pos = line.indexOf(":");
      if (pos != -1) {
        value = line.slice(pos + 1);
        if (value[0] == ' ') {
          value = value.slice(1);
        }
        line = line.slice(0, pos);
      }
      switch (line) {
      case 'event':
        this.event.name = value;
        break;
      case 'data':
        this.event.data += value + "\n";
        break;
      case 'id':
        this.event.id = value;
        break;
      case 'retry':
        if (Number.isInteger(value)) {
          this.event.retry = Number(value);
        }
        break;
      }
    }
  }
}
