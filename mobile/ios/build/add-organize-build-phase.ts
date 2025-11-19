/**
 * Add "Organize Node.js Native Modules" build phase to Xcode project
 * Runs after cap sync to ensure the organize phase is present
 */

import path from "node:path";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import xcode from "xcode";

const __dirname = import.meta.dirname;

function reorderBuildPhases(content: string): string {
  const targetUuid = "504EC3031FED79650016851F";
  const regex = new RegExp(
    `(${targetUuid}\\s*\\/\\* App \\*\\/\\s*=\\s*\\{[\\s\\S]*?buildPhases\\s*=\\s*\\()([\\s\\S]*?)(\\s*\\);[\\s\\S]*?name\\s*=\\s*App;)`,
    'm'
  );

  const match = content.match(regex);
  if (!match) return content;

  const phases = match[2].split('\n').filter(l => l.trim() && /[A-F0-9]+\s*\/\*/.test(l.trim()));
  if (phases.length === 0) return content;

  const build = phases.find(l => /Build Node\.js Mobile Native Modules/.test(l));
  const organize = phases.find(l => /Organize Node\.js Native Modules/.test(l));
  const sign = phases.find(l => /Sign Node\.js Mobile Native Modules/.test(l));
  const others = phases.filter(l => l !== build && l !== organize && l !== sign);

  const ordered = [...others, build, organize, sign].filter((l): l is string => l !== undefined);
  const indent = match[2].match(/^(\s+)/)?.[1] || '\t\t\t\t';
  const newPhases = ordered.map(l => indent + l.trim() + (l.trim().endsWith(',') ? '' : ',')).join('\n');

  return content.replace(regex, `$1${newPhases}\n$3`);
}

async function addOrganizeBuildPhase() {
  const pbxprojFile = path.join(__dirname, "../App/App.xcodeproj/project.pbxproj");
  if (!existsSync(pbxprojFile)) {
    console.error(`Xcode project not found: ${pbxprojFile}`);
    process.exit(1);
  }

  const project = xcode.project(pbxprojFile);
  try {
    project.parseSync();
  } catch (error) {
    console.error(`Failed to parse Xcode project: ${error}`);
    process.exit(1);
  }

  const target = project.getFirstTarget();
  if (!target) {
    console.error("No targets found");
    process.exit(1);
  }

  const phaseName = "Organize Node.js Native Modules";
  const script = `set -e
if [ -n "$PROJECT_DIR" ] && [ -d "$PROJECT_DIR/../../node_modules/.bin" ]; then
  export PATH="$PROJECT_DIR/../../node_modules/.bin:$PATH"
fi
SCRIPT_PATH="$PROJECT_DIR/../build/organize-node-modules.ts"
[ ! -f "$SCRIPT_PATH" ] && SCRIPT_PATH="$SRCROOT/../build/organize-node-modules.ts"
[ ! -f "$SCRIPT_PATH" ] && echo "Error: organize-node-modules.ts not found" && exit 1
node --experimental-strip-types "$SCRIPT_PATH" || true`;

  let content = readFileSync(pbxprojFile, "utf8");
  const exists = content.includes(phaseName);

  if (exists) {
    const phaseRegex = /(name = "Organize Node\.js Native Modules";[\s\S]*?shellScript = ")([\s\S]*?)(";[\s\S]*?};)/;
    if (phaseRegex.test(content)) {
      const escaped = script.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
      content = content.replace(phaseRegex, `$1${escaped}$3`);
      console.log(`Updated build phase: ${phaseName}`);
    }
  } else {
    project.addBuildPhase([], "PBXShellScriptBuildPhase", phaseName, target.uuid, {
      shellScript: script,
      shellPath: "/bin/sh",
    });
    content = project.writeSync();
    console.log(`Added build phase: ${phaseName}`);
  }

  content = reorderBuildPhases(content);
  writeFileSync(pbxprojFile, content);
  console.log("Reordered build phases: Build -> Organize -> Code Sign");
}

addOrganizeBuildPhase().catch((error) => {
  console.error(error);
  process.exit(1);
});
