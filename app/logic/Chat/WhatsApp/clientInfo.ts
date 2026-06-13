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
import {
  type ClientPayload, type DevicePairingRegistrationData,
  Platform, Product, ConnectType, ConnectReason, DevicePlatformType, DeviceProps,
} from "./Proto/handshakeSchema";
import { encode } from "./Proto/codec";
import { md5 } from "./Crypto/primitives";
import { appName } from "../../build";

export const kWaAndroidClient = {
  appVersion: "2.26.23.7",
  osVersion: "15",
  manufacturer: "samsung",
  device: "SM-A266B", // Galaxy A26 5G global
  osBuildNumber: "AP3A.240905.015.A266BXXU9CZEA", // AOSP build id + `.` + Samsung firmware
  localeLanguage: "en",
  localeCountry: "DE",
  mcc: "262", // Germany
  mnc: "07", // O2
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
/** The UserAgent describing us as the WhatsApp Android client. Shared by the
 * login and the companion-registration payloads. */
function userAgent() {
  return {
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
  };
}

export function getLoginPayload(username: number, device: number): ClientPayload {
  return {
    username,
    device,
    passive: true,
    pull: true,
    connectType: ConnectType.WifiUnknown,
    connectReason: ConnectReason.UserActivated,
    product: Product.WhatsApp,
    userAgent: userAgent(),
  };
}

/** The server-expected build hash for our advertised app version: MD5 of the
 * dotted version string. */
export const kWaBuildHash = md5(new TextEncoder().encode(kWaAndroidClient.appVersion));

/** How this companion presents itself in the phone's "Linked devices" list.
 * `requireFullSync` asks the phone, at link time, to push its ENTIRE retained
 * history (HistorySyncType FULL = 2) instead of only the recent bootstrap chunk
 * — the load-bearing path for "download the whole chat history after pairing". */
export function getDeviceProps(): Uint8Array {
  return encode(DeviceProps, {
    os: appName,
    platformType: DevicePlatformType.Desktop,
    requireFullSync: true,
  });
}

/** The companion-registration ClientPayload. Unlike login it is not `passive`
 * and carries no username/device yet; instead it offers our Signal key bundle
 * in `devicePairingData`, which the server uses to drive QR pairing. */
export function getRegistrationPayload(registrationData: DevicePairingRegistrationData): ClientPayload {
  return {
    passive: false,
    pull: false,
    connectType: ConnectType.WifiUnknown,
    connectReason: ConnectReason.UserActivated,
    product: Product.WhatsApp,
    userAgent: userAgent(),
    devicePairingData: registrationData,
  };
}
