import { assert, blobToDataURL, type URLString } from "../../../logic/util/util";

/** Given a domain name, find the website's homepage favicon
 * Uses server-side API: beonex.com proxies to google.com
 * @returns `data:` image URL */
export async function getFavIcon(site: string): Promise<URLString | null> {
  try {
    let imageURL = `https://parula.beonex.com/favicon/${site}`;
    console.log("get favicon for", site, "at", imageURL);
    return await fetchIcon(imageURL);
  } catch (ex) {
    console.error(ex);
    return null;
  }
}

/** Given a domain name, find the website's homepage favicon
 * TODO Cannot decode .ico files
 * @returns `data:` image URL */
export async function getFavIconLocal(site: string): Promise<URLString | null> {
  try {
    let response;
    let pageURL = `https://${site}`;
    try {
      console.log("get favicon for", site, "at", pageURL);
      response = await fetch(pageURL);
      assert(response.ok, `Favicon fetch failed for ${pageURL}`);
    } catch (ex) {
      pageURL = `https://www.${site}`;
      console.log("get favicon for", site, "at", pageURL);
      response = await fetch(pageURL);
    }
    assert(response.ok, `Favicon fetch failed for ${pageURL}`);
    let htmlStr = await response.text();
    let htmlDoc = new DOMParser().parseFromString(htmlStr, "text/html");
    console.log("favicon: got doc", htmlDoc);
    for (let selector of selectors) {
      try {
        let node = htmlDoc.querySelector(selector.sel);
        let url = selector.href && node?.getAttribute("href") ||
          selector.content && node?.getAttribute("content");
        if (!url) {
          continue;
        }
        let urlAbsolute = new URL(url, pageURL).href;
        return await fetchIcon(urlAbsolute);
      } catch (ex) {
        console.error(ex);
      }
    }
    return null;
  } catch (ex) {
    console.error(ex);
    return null;
  }
}

const selectors = [
  { sel: `link[rel="apple-touch-icon"]`, href: true },
  { sel: `link[rel="apple-touch-icon-precomposed"]`, href: true },
  { sel: `link[rel="shortcut icon"]`, href: true },
  { sel: `link[rel="icon"]`, href: true },
  { sel: `meta[property="og:image"]`, content: true },
  { sel: `meta[name="twitter:image"]`, content: true },
  { sel: `meta[name="msapplication-TileImage"]`, content: true },
];

/** @returns `data:` image URL */
async function fetchIcon(url: URLString): Promise<URLString> {
  // console.log("fetching", url);
  let response = await fetch(url);
  assert(response.ok, `Favicon fetch failed for ${url}`);
  //assert(response.type?.startsWith("image/"), `Favicon ${url} returned ${response.type}`); -- fails with "returned cors"
  let blob = await response.blob();
  return await blobToDataURL(blob);
}
