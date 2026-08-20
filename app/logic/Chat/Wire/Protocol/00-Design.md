# Wire implementation — design and module contract

The map from the protocol documents in this directory onto our code. Read this
before touching `app/logic/Chat/Wire/`. It fixes the file layout and the API
between the modules, so that the pieces fit together.

MLS itself is **not** here: it lives in `app/logic/Chat/MLS/` and knows nothing
about Wire. This directory holds only what is Wire-specific — the REST API, the
session, the event stream, the delivery-service glue that carries MLS messages,
and the mapping onto our `ChatAccount` / `ChatRoom` / `ChatMessage` objects.

## Ground rules

- **Clean room.** No code copied from wire-webapp, wire-android or core-crypto.
  The documents in this directory are the spec.
- **Code style** follows `Mail/IMAP/` and `Mail/JMAP/`, *not* `Chat/WhatsApp/` or
  `Chat/Signal/`: `let` not `const` (except hardcoded literals), `ID` spelled
  uppercase, `x?.y()` not `x ? x.y() : undefined`, the main class first in the
  file, comments short and only where the code surprises.
- **Object orientation.** Nouns are classes, verbs are their methods. No bag of
  free exported functions; a new global function only if it is a generic helper.
- **Reuse the app.** `Attachment`, `Person`, `Group`, `ChatPersonUID`, the SQL
  chat storage, `Observable`/`notifyChangedProperty`, `sanitize`, `gt`,
  `ArrayColl`/`MapColl`, `Lock`/`Throttle`/`RunOnce` from `util/flow/`,
  `netUtil`'s `isTransientError`/`retryOnTransientError`/`waitUntilOnline`.
  The protobuf codec is `Chat/Signal/Proto/codec.ts`, which `Chat/WhatsApp/`
  already reuses — do not write another one.
- **Sanitize at the boundary.** Everything that comes off the network goes
  through `sanitize.*` once, where it is parsed. Values read back out of our own
  objects or DB are already clean; do not re-sanitize them.
- **Identify as Parula.** Every place the official client sends its own name, we
  send ours. Collected in `clientInfo.ts`; nothing else may hardcode it.
- **All platforms.** Electron (macOS/Linux/Windows) and Capacitor (Android/iOS).
  Nothing may depend on a desktop-only API without a fallback.

## File layout

| Path | Holds |
|---|---|
| `WireTransport.ts` | HTTP: base URL, API version, the `zuid` cookie, error mapping |
| `WireSession.ts` | login (password and SSO), access-token refresh, our client (device) registration |
| `WireAPI.ts` | every REST call, typed. No state beyond the transport. |
| `TWire.ts` | the JSON shapes the server returns, as `type`s |
| `WireEventStream.ts` | the WebSocket plus the `/notifications` catch-up |
| `WireAccount.ts` | `ChatAccount` subclass: login, rooms, roster, wiring it all together |
| `WireChatRoom.ts`, `Wire1to1ChatRoom.ts`, `WireGroupChatRoom.ts` | `ChatRoom` subclasses |
| `WireChatMessage.ts`, `WireRoomEvent.ts` | `ChatMessage` / `ChatRoomEvent` subclasses |
| `WirePerson.ts` | `ChatPersonUID` subclass |
| `WireMLSService.ts` | the Wire side of MLS: key packages, commit bundles, group info, welcomes |
| `WireMedia.ts` | asset upload/download and their encryption |
| `Proto/messages.ts` | the `GenericMessage` protobuf, in the codec DSL |
| `clientInfo.ts` | our product name, version, device class and label |

## Transport

`WireTransport` is the only place that talks HTTP. It owns three things the rest
of the code must not duplicate: the API version prefix, the bearer token, and the
`zuid` cookie.

The `zuid` cookie is the long-lived credential — for an SSO account it is the
*only* one, since there is no password to log in with again. Node's `fetch` has no
cookie jar, so we read `Set-Cookie` ourselves and send `Cookie: zuid=…` back, the
same way Wire's own api-client does in Node. That needs the response headers,
which the app's `remoteApp.kyCreate()` did not expose, so it gained a
`result: "response"` mode returning `{ok, status, statusText, headers, body}` with
the body as bytes. Combined with `throwHttpErrors: false` this also gives us the
error body, which Wire needs: its failures are distinguished by the `label` field
of a `{code, label, message}` JSON body, not by the HTTP status alone.

```ts
export class WireTransport {
  /** e.g. `https://prod-nginz-https.wire.com` */
  baseURL: string;
  /** The negotiated API version, used as the `/vN` path prefix */
  version: number;
  accessToken: string | null;
  /** The `zuid` cookie value, persisted across restarts */
  cookie: string | null;

  constructor(baseURL: string);

  /** `GET /api-version`, picks the highest version we both support.
   * Not version-prefixed. Also learns the backend's own `domain`. */
  async negotiateVersion(): Promise<void>;
  get domain(): string;

  /** The versioned calls. `path` starts with a slash and has no version prefix. */
  async get(path: string, options?: WireRequestOptions): Promise<any>;
  async post(path: string, json: any, options?: WireRequestOptions): Promise<any>;
  async put(path: string, json: any, options?: WireRequestOptions): Promise<any>;
  async delete(path: string, json?: any, options?: WireRequestOptions): Promise<any>;
  /** For `message/mls` and `application/x-protobuf` bodies */
  async postBinary(path: string, body: Uint8Array, contentType: string,
    options?: WireRequestOptions): Promise<any>;
  async getBinary(path: string, options?: WireRequestOptions): Promise<Uint8Array>;

  /** Called on 401 by the callers above; supplied by `WireSession`. */
  onTokenExpired: (() => Promise<void>) | null;
}

export interface WireRequestOptions {
  /** Skip the `/vN` prefix, for `/api-version` and `/access` */
  unversioned?: boolean;
  /** Send `Cookie: zuid=…`. Only `/access` and `/cookies` need it. */
  withCookie?: boolean;
  /** Do not try to refresh the token and retry on a 401 */
  noRetryOnExpiry?: boolean;
  query?: Record<string, string | number | boolean>;
  headers?: Record<string, string>;
}

/** A `{code, label, message}` error from the backend. Callers switch on `label`. */
export class WireError extends Error {
  readonly httpCode: number;
  readonly label: string;
  readonly serverMessage: string;
  /** Anything else the body carried, e.g. the missing/redundant client lists */
  readonly data: any;
}
```

## Session

```ts
export class WireSession {
  readonly transport: WireTransport;
  /** Our own qualified user ID and the client (device) ID */
  userID: string;
  domain: string;
  clientID: string | null;

  /** Email address + password. Handles the 2FA round trip via `onVerificationCode`. */
  async loginWithPassword(email: string, password: string): Promise<void>;
  /** SSO. Opens the browser flow and waits for the cookie. */
  async loginWithSSO(code: string): Promise<void>;
  /** From the stored cookie, at startup. No user interaction. */
  async resume(): Promise<void>;
  /** `POST /access`, unversioned, with the cookie. Also rotates the cookie. */
  async refreshToken(): Promise<void>;
  async logout(): Promise<void>;

  /** Registers this device if we do not have one yet, else verifies ours is still
   * there. Uploads the MLS signature public key. */
  async ensureClient(mlsPublicKeys: Record<string, string>): Promise<void>;

  /** Asked for when the backend demands a 2FA code. Set by the account. */
  onVerificationCode: (() => Promise<string>) | null;

  toJSON(): any;
  fromJSON(json: any): void;
}
```

## Event stream

```ts
export class WireEventStream {
  constructor(session: WireSession, api: WireAPI);
  /** Connects, catches up on missed notifications, then goes live.
   * Reconnects by itself until `stop()`. */
  async start(lastNotificationID: string | null): Promise<void>;
  async stop(): Promise<void>;
  /** Called for every event, in order, one at a time. Must not run concurrently:
   * MLS epochs only advance correctly in sequence. */
  onEvent: (event: TWireEvent) => Promise<void>;
  /** The stream was lost and we could not catch up; the caller must refetch
   * conversations and users from scratch. */
  onDesynchronized: (() => Promise<void>) | null;
  /** Persisted, so the next start resumes where we stopped */
  lastNotificationID: string | null;
}
```

## Persistence

- Account-level state (base URL, API version, user ID, domain, client ID, the
  `zuid` cookie, `lastNotificationID`, our MLS signature key pair and published
  key packages) goes into `WireAccount.toConfigJSON()` / `fromConfigJSON()`, like
  `SignalAccount` does.
- Per-conversation MLS group state goes into `WireChatRoom.toExtraJSON()` /
  `fromExtraJSON()`, which the SQL chat storage merges into the room's `json`
  column. The ratchet tree is stored as base64 of its `ratchet_tree` encoding, not
  as expanded JSON.
- Messages and rooms use the existing `SQLChatStorage`; nothing new in the DB
  schema.

## What we do not implement

- **Proteus.** Wire's legacy per-device encryption. See `09-Proteus.md` for when
  it is still needed; MLS is the path we take.
- **Calls.** Call signalling rides in the `Calling` protobuf; the media layer is
  Wire's own AVS/SFT. Out of scope.
- **E2EI / x509 credentials.** Basic credentials only, which is what the cloud
  backend uses unless a team turns E2EI on.
