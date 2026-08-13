/**
 * Runs `ntlmChromium.electron.ts` — the NTLM-via-Chromium tests — under
 * Electron, against the same strict mock server as our own implementation.
 * Skipped when the Electron binary is not installed (`desktop/` not set up)
 * or cannot run in this environment.
 */
import { describe, expect, it } from "vitest";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const kElectronArgs = ["--no-sandbox", "--ozone-platform=headless", "--disable-gpu"];
const here = path.dirname(fileURLToPath(import.meta.url));
const appDir = path.resolve(here, "../../../..");

/** Path to the Electron binary, if it is installed and runs here */
let electron: string | null = null;
try {
  // @ts-ignore The package's main exports the path to the binary
  electron = (await import("../../../../../desktop/node_modules/electron/index.js")).default;
  let probe = spawnSync(electron, [...kElectronArgs, "--version"], { encoding: "utf8", timeout: 30000 });
  if (probe.status !== 0) {
    console.warn("Electron cannot run in this environment. Skipping the NTLM-via-Chromium tests.\n" + probe.stderr);
    electron = null;
  }
} catch (ex) {
  console.warn("Electron is not installed. Skipping the NTLM-via-Chromium tests.");
}

describe.skipIf(!electron)("NTLM via Chromium network stack", () => {
  it("passes the same mock server scenarios", async () => {
    let bundle = path.join(mkdtempSync(path.join(tmpdir(), "ntlm-chromium-")), "ntlmChromium.electron.cjs");
    execFileSync(path.join(appDir, "node_modules/.bin/esbuild"),
      [path.join(here, "ntlmChromium.electron.ts"),
        "--bundle", "--platform=node", "--format=cjs", "--external:electron",
        "--outfile=" + bundle]);
    let result = spawnSync(electron, [...kElectronArgs, bundle],
      { encoding: "utf8", timeout: 120 * 1000 });
    console.log(result.stdout);
    if (result.status !== 0 || !result.stdout.includes("all checks passed")) {
      console.error(result.stderr);
    }
    expect(result.status).toBe(0);
    // A timeout kill can still exit with code 0, so check for the marker
    expect(result.stdout).toContain("all checks passed");
  }, 150 * 1000);
});
