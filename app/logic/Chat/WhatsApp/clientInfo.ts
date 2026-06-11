/** The client identity we present to WhatsApp for the CHAT protocol: we pose as
 * the WhatsApp Android client. This is the single source of truth for that
 * identity, so both the protobuf `UserAgent` (in the ClientPayload) and any HTTP
 * request (media upload/download to mmg.whatsapp.net) describe the same Android
 * device — never the machine we actually run on.
 *
 * GUARDRAIL: never let an HTTP request use the runtime's default User-Agent.
 * On Windows that default reveals "Windows NT ..."; under Electron it reveals
 * Chrome/Electron. Every WhatsApp HTTP request MUST set `kWaHttpUserAgent`
 * explicitly. (Calls are the one exception — they use the Web profile — but
 * those go over WebRTC, not HTTP, so this Android HTTP identity still holds for
 * all chat-side HTTP.) Keep the version current or the server rejects the client
 * as outdated. */
import { type ClientPayload, Platform, Product } from "./Proto/handshakeSchema";

export const kWaAndroidClient = {
  appVersion: "2.24.20.85",
  osVersion: "13",
  manufacturer: "Samsung",
  device: "SM-G991B", // Galaxy S21
  osBuildNumber: "TP1A.220624.014",
  localeLanguage: "en",
  localeCountry: "US",
  mcc: "000",
  mnc: "000",
};

/** App version as the protobuf AppVersion fields (primary.secondary.tertiary). */
export const kWaAppVersion = (() => {
  let [primary, secondary, tertiary] = kWaAndroidClient.appVersion.split(".").map(Number);
  return { primary, secondary, tertiary };
})();

/** The HTTP User-Agent to use for ALL WhatsApp HTTP requests (media etc.).
 * Matches the WhatsApp Android app format, so it never leaks the host OS. */
export const kWaHttpUserAgent =
  `WhatsApp/${kWaAndroidClient.appVersion} Android/${kWaAndroidClient.osVersion} ` +
  `Device/${kWaAndroidClient.manufacturer}-${kWaAndroidClient.device}`;

/** The login ClientPayload, advertising us as the WhatsApp Android client.
 * Its UserAgent describes an Android device, never the host OS. */
export function buildLoginPayload(username: number, device: number): ClientPayload {
  return {
    username,
    device,
    passive: true,
    pull: true,
    product: Product.WhatsApp,
    userAgent: {
      platform: Platform.Android,
      appVersion: kWaAppVersion,
      osVersion: kWaAndroidClient.osVersion,
      manufacturer: kWaAndroidClient.manufacturer,
      device: kWaAndroidClient.device,
      osBuildNumber: kWaAndroidClient.osBuildNumber,
      mcc: kWaAndroidClient.mcc,
      mnc: kWaAndroidClient.mnc,
      localeLanguageIso6391: kWaAndroidClient.localeLanguage,
      localeCountryIso31661Alpha2: kWaAndroidClient.localeCountry,
    },
  };
}
