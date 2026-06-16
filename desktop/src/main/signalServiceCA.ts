/** Trust Signal's private service CA for the renderer's TLS to `*.signal.org`.
 *
 * Signal's service hosts (chat / storage / cdn / cdsi / sfu) present certificates
 * that root in Signal's OWN self-signed CA, not a public one, so Chromium rejects
 * them (`ERR_CERT_AUTHORITY_INVALID`) and the renderer's `fetch` fails. The official
 * apps bundle this root and pin to it. Here we install a certificate verification
 * hook on the default session: for Signal hosts we verify the leaf is issued by
 * Signal's pinned root, matches the hostname, and is in its validity window; every
 * other host falls through to normal Chromium verification.
 *
 * This covers the renderer's HTTPS REST. The chat-service WebSocket does NOT go
 * through Chromium at all — Electron's webRequest can't add the Authorization header
 * to a WebSocket upgrade — so it runs in the Node backend (`newWebSocket`), which
 * trusts the same root via the `ca` TLS option. Both read the PEM from
 * `Signal/Connection/serviceCA`. */
import { session } from "electron";
import { X509Certificate } from "crypto";
import { kSignalServiceRootCA } from "../../../app/logic/Chat/Signal/Connection/serviceCA";

const signalRoot = new X509Certificate(kSignalServiceRootCA);

function isSignalServiceHost(hostname: string): boolean {
  return hostname == "signal.org" || hostname.endsWith(".signal.org");
}

/** Verify a leaf cert presented by a Signal host: issued by Signal's pinned root,
 * matches the hostname, and currently in date. (Signal's leaves are signed directly
 * by the root — no intermediate — so a single signature check suffices.) */
function isTrustedSignalCert(hostname: string, leafPEM: string): boolean {
  try {
    let leaf = new X509Certificate(leafPEM);
    let now = Date.now();
    return leaf.verify(signalRoot.publicKey)
      && !!leaf.checkHost(hostname)
      && Date.parse(leaf.validFrom) <= now && now <= Date.parse(leaf.validTo);
  } catch (ex) {
    console.error("Signal CA: certificate verification error:", ex);
    return false;
  }
}

/** Install the hook on the default session. Call once, after the app is ready. */
export function installSignalServiceCATrust(): void {
  session.defaultSession.setCertificateVerifyProc((request, callback) => {
    if (!isSignalServiceHost(request.hostname)) {
      callback(-3); // not a Signal host → normal Chromium verification
      return;
    }
    callback(isTrustedSignalCert(request.hostname, request.certificate.data) ? 0 : -2);
  });
}
