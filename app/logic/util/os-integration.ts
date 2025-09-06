// #if [MOBILE]
import { Browser } from "@capacitor/browser";
// #else
import { appGlobal } from "../app";
// #endif

export async function openExternalURL(url: string) {
  // #if [MOBILE]
  return await Browser.open({ url });
  // #else
  return await appGlobal.remoteApp.openExternalURL(url);
  // #endif
}
