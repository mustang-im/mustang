// app first, to resolve the import cycle around Addons
import { appGlobal } from "../../../../logic/app";
import { Addon, type AddonRegistration } from "../../../../logic/Addons/Addon";
import { AddonManifest } from "../../../../logic/Addons/AddonManifest";
import { AddonProtocols } from "../../../../logic/Addons/AddonProtocols";
import { AddonBridge } from "../../../../logic/Addons/Bridge/AddonBridge";
import { AddonAPI } from "../../../../logic/Addons/Bridge/AddonAPI";
import { AddonBudget } from "../../../../logic/Addons/Bridge/AddonBudget";
import { SandboxFrame } from "../../../../logic/Addons/Sandbox/SandboxFrame";
import { apiClasses, apiEnums } from "../../../../logic/Addons/API/apiTypes";
import type { MustangAPI } from "../../../../logic/Addons/Sandbox/MustangAPI";
import { Person } from "../../../../logic/Abstract/Person";
import { InProcessSQLiteDatabase } from "../../util/inProcessSQLite";
import { TestClient } from "../../Addons/Bridge/fixtures";
import { mkdtempSync } from "node:fs";
import fsPromises from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

const api = new AddonAPI(apiClasses, apiEnums);

/** The addon's runtime in the test, with a way to wait until the app processed what it sent */
export class ProtocolTestClient extends TestClient {
  async roundTrip(): Promise<void> {
    await this.callService("roundTrip", "ping", []);
  }
}

/** Stands in for `AddonSandbox` (with `vi.mock()`): the real bridge, `AddonProtocols` and sandbox runtime,
 * connected by `MessageChannel`s instead of frames, which node can't run.
 * Runs `ProtocolSandbox.mainCode` of the addon as its main code. */
export class ProtocolSandbox {
  /** Addon ID -> its main code */
  static readonly mainCode = new Map<string, (mustang: MustangAPI) => void>();
  readonly addon: Addon;
  readonly protocols: AddonProtocols;
  logicFrame: { bridge: AddonBridge } | null = null;
  logic: ProtocolTestClient;
  readonly uiFrames: { frame: SandboxFrame, client: ProtocolTestClient, entry: string }[] = [];
  isStopped = false;

  constructor(addon: Addon) {
    this.addon = addon;
    this.protocols = new AddonProtocols(this as any);
  }

  async start(): Promise<void> {
    let { bridge, client } = await this.connect();
    this.logicFrame = { bridge };
    this.logic = client;
    ProtocolSandbox.mainCode.get(this.addon.id)?.(client.mustang);
    await client.roundTrip();
  }

  /** Like a UI frame, e.g. the `setup` of a protocol */
  async connect(): Promise<{ bridge: AddonBridge, client: ProtocolTestClient }> {
    let channel = new MessageChannel();
    let bridge = new AddonBridge(channel.port1, api, this.addon.apiGroups, new AddonBudget());
    bridge.registerService("protocols", this.protocols);
    bridge.registerService("roundTrip", { call: () => null });
    let client = new ProtocolTestClient();
    client.start(channel.port2);
    bridge.start({ name: this.addon.name, version: "1.0.0" });
    await client.whenInitialized();
    return { bridge, client };
  }

  /** Like `AddonSandbox.openUIFrame()`, for `AddonFrame.svelte` in happy-dom */
  async openUIFrame(_container: HTMLElement, entry: string, beforeLoad?: (frame: SandboxFrame) => void): Promise<SandboxFrame> {
    let frame = new SandboxFrame(this.addon.name);
    let { bridge, client } = await this.connect();
    frame.bridge = bridge;
    beforeLoad?.(frame);
    this.uiFrames.push({ frame, client, entry });
    return frame;
  }

  closeUIFrame(frame: SandboxFrame): void {
    frame.remove();
  }

  register(registration: AddonRegistration): void {
    if (this.isStopped) {
      throw new Error("Stopped");
    }
    this.addon.registrations.add(registration);
  }

  unregister(): void {
    this.isStopped = true;
    this.logicFrame?.bridge.close();
    this.logicFrame = null;
    if (this.addon.sandbox == this as any) {
      this.addon.sandbox = null;
    }
  }
}

/** An installed, not yet running addon with mail protocols. Start it with `addon.enable()`. */
export function newProtocolAddon(name: string, protocols = ["test"], mainCode?: (mustang: MustangAPI) => void): Addon {
  let manifest = AddonManifest.fromJSON({
    name: "@test/" + name.toLowerCase().replaceAll(" ", "-"),
    version: "1.0.0",
    mustang: {
      name,
      main: "dist/main.js",
      protocols: protocols.map(id => ({ id, type: "mail", label: name + " " + id, setup: "dist/setup.js" })),
    },
  }, null);
  let addon = new Addon(appGlobal.addons, manifest, { deleteAll: async () => {} } as any);
  addon.isEnabled = false;
  appGlobal.addons.installed.add(addon);
  if (mainCode) {
    ProtocolSandbox.mainCode.set(addon.id, mainCode);
  }
  return addon;
}

/** In-process databases in a temp dir, and the backend functions that the mail code needs */
export function setUpBackend(): void {
  appGlobal.me ??= new Person();
  let tempDir = mkdtempSync(path.join(tmpdir(), "addon-mail-test-"));
  let storage = new Map<string, string>();
  globalThis.localStorage ??= {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, String(value)),
    removeItem: (key: string) => storage.delete(key),
    clear: () => storage.clear(),
  } as any;
  appGlobal.remoteApp = {
    getSQLiteDatabase: (filename: string) => new InProcessSQLiteDatabase(path.join(tempDir, filename)),
    getFilesDir: () => tempDir,
    getConfigDir: () => tempDir,
    path,
    fs: fsPromises,
    getMIMENodemailer: async (mail: any) => new TextEncoder().encode(`Subject: ${mail.subject}\r\nBcc-Count: ${mail.bcc?.length ?? 0}\r\n\r\n${mail.text}`),
  } as any;
}

/** Waits until `condition` is true, while the bridge messages go back and forth */
export async function waitFor(condition: () => boolean, timeoutMS = 5000): Promise<void> {
  let end = Date.now() + timeoutMS;
  while (!condition() && Date.now() < end) {
    await new Promise(resolve => setTimeout(resolve, 5));
  }
  if (!condition()) {
    throw new Error("Timeout");
  }
}
