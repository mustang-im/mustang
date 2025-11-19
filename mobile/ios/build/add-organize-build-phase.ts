/**
 * Add "Organize Node.js Native Modules" build phase to Xcode project
 */

import path from "node:path";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import xcode from "xcode";

const __dirname = import.meta.dirname;
const APP_TARGET_UUID = "504EC3031FED79650016851F";
const PHASE_NAME = "Organize Node.js Native Modules";

const ORGANIZE_SCRIPT = `set -e
if [ -n "$PROJECT_DIR" ] && [ -d "$PROJECT_DIR/../../node_modules/.bin" ]; then
  export PATH="$PROJECT_DIR/../../node_modules/.bin:$PATH"
fi
SCRIPT_PATH="$PROJECT_DIR/../build/organize-node-modules.ts"
[ ! -f "$SCRIPT_PATH" ] && SCRIPT_PATH="$SRCROOT/../build/organize-node-modules.ts"
[ ! -f "$SCRIPT_PATH" ] && echo "Error: organize-node-modules.ts not found" && exit 1
node --experimental-strip-types "$SCRIPT_PATH" || true`;

function reorderBuildPhases(content: string): string {
  const regex = new RegExp(
    `(${APP_TARGET_UUID}\\s*\\/\\* App \\*\\/\\s*=\\s*\\{[\\s\\S]*?buildPhases\\s*=\\s*\\()([\\s\\S]*?)(\\s*\\);[\\s\\S]*?name\\s*=\\s*App;)`,
    'm'
  );

  const match = content.match(regex);
  if (!match) return content;

  const phaseLines = match[2]
    .split('\n')
    .filter(line => line.trim() && /[A-F0-9]+\s*\/\*/.test(line.trim()));

  if (phaseLines.length === 0) return content;

  // Separate phases by type
  const buildPhase = phaseLines.find(line => line.includes("Build Node.js Mobile Native Modules"));
  const organizePhase = phaseLines.find(line => line.includes("Organize Node.js Native Modules"));
  const signPhase = phaseLines.find(line => line.includes("Sign Node.js Mobile Native Modules"));
  const otherPhases = phaseLines.filter(
    line => line !== buildPhase && line !== organizePhase && line !== signPhase
  );

  // Reorder: others first, then build -> organize -> sign
  const ordered = [
    ...otherPhases,
    buildPhase,
    organizePhase,
    signPhase,
  ].filter((line): line is string => line !== undefined);

  const indent = match[2].match(/^(\s+)/)?.[1] || '\t\t\t\t';
  const formatted = ordered
    .map(line => indent + line.trim() + (line.trim().endsWith(',') ? '' : ','))
    .join('\n');

  return content.replace(regex, `$1${formatted}\n$3`);
}

function escapeScriptForPbxproj(script: string): string {
  return script
    .replace(/\\/g, '\\\\')  // Escape backslashes
    .replace(/"/g, '\\"')     // Escape quotes
    .replace(/\n/g, '\\n');   // Escape newlines
}

// Main execution
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

let content = readFileSync(pbxprojFile, "utf8");
const phaseExists = content.includes(PHASE_NAME);

if (phaseExists) {
  // Update existing phase
  const escapedScript = escapeScriptForPbxproj(ORGANIZE_SCRIPT);
  const phaseRegex = /(name = "Organize Node\.js Native Modules";[\s\S]*?shellScript = ")([\s\S]*?)(";[\s\S]*?};)/;
  content = content.replace(phaseRegex, `$1${escapedScript}$3`);
  console.log(`Updated build phase: ${PHASE_NAME}`);
} else {
  // Add new phase
  project.addBuildPhase([], "PBXShellScriptBuildPhase", PHASE_NAME, target.uuid, {
    shellScript: ORGANIZE_SCRIPT,
    shellPath: "/bin/sh",
  });
  content = project.writeSync();
  console.log(`Added build phase: ${PHASE_NAME}`);
}

content = reorderBuildPhases(content);
writeFileSync(pbxprojFile, content);
console.log("Reordered build phases: Build -> Organize -> Code Sign");
