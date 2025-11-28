import { session as Session, BrowserWindow, net as Net } from "electron";
import { Readable } from 'stream';

const kCanaryName = "X-OWA-CANARY";
const kHotmailServer = "outlook.live.com";

// To log in to Hotmail or Office 365 environments, we need to
// scrape the Authorization header from the startupdata request.
let scrapedAuth: Record<string, string> = {};

/**
 * Used by the front end to tell whether this is Hotmail or Office 365.
 */
export function getAnyScrapedAuth(partition: string) {
  return scrapedAuth[partition];
}

/**
 * Used by the front end to start watching for startupdata requests.
 */
export function scrapeStartupDataAuth(partition: string) {
  let session = Session.fromPartition(partition);
  session.webRequest.onSendHeaders({
    urls: ["https://*/*startupdata*"],
  }, async (details: { requestHeaders: Record<string, string>, frame: { executeJavaScript: (code : string) => Promise<any> } }) => {
    // Note: this differs from the browser.webRequest.onSendHeaders API!
    for (let name in details.requestHeaders) {
      if (/^Authorization$/i.test(name)) {
        scrapedAuth[partition] = details.requestHeaders[name];
        // We need to notify the front end. It's already listening for
        // load events, so this is the easiest way.
        await details.frame.executeJavaScript("document.location = 'about:blank';");
      }
    }
  });
}

export async function fetchJSON(partition: string, url: string, options: any) {
  let result = {
    ok: false,
    status: 0,
    statusText: '',
    url: '',
    contentType: '',
    json: null,
  };
  let session = Session.fromPartition(partition);
  options ??= {};
  options.headers ??= {};
  let cookies = await session.cookies.get({ name: kCanaryName });
  if (!cookies.length) {
    result.status = 401;
    return result;
  }
  options.headers[kCanaryName] = cookies[0].value;
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

export async function clearStorageData(partition: string) {
  delete scrapedAuth[partition];
  let session = Session.fromPartition(partition);
  session.webRequest.onSendHeaders(null);
  await session.clearStorageData();
}
