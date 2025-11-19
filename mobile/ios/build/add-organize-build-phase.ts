import path from "node:path";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import xcode from "xcode";

const __dirname = import.meta.dirname;

/**
 * Reorder build phases to ensure correct execution order:
 * 1. Other phases (Sources, Frameworks, Resources, etc.)
 * 2. Build Node.js Mobile Native Modules
 * 3. Organize Node.js Native Modules
 * 4. Sign Node.js Mobile Native Modules
 */
function reorderBuildPhases(pbxprojContent: string): string {
  const targetUuid = "504EC3031FED79650016851F";

  // Match the buildPhases section - be more flexible with whitespace
  const buildPhasesRegex = new RegExp(
    `(${targetUuid}\\s*\\/\\* App \\*\\/\\s*=\\s*\\{[\\s\\S]*?buildPhases\\s*=\\s*\\()([\\s\\S]*?)(\\s*\\);[\\s\\S]*?name\\s*=\\s*App;)`,
    'm'
  );

  const match = pbxprojContent.match(buildPhasesRegex);
  if (!match) {
    console.warn("Warning: Could not find buildPhases section, skipping reorder");
    return pbxprojContent;
  }

  const phasesSection = match[2];

  // Extract all phase lines (preserving original formatting)
  const phaseLines = phasesSection.split('\n').filter(line => {
    const trimmed = line.trim();
    return trimmed && /[A-F0-9]+\s*\/\*/.test(trimmed);
  });

  if (phaseLines.length === 0) {
    console.warn("Warning: No build phases found, skipping reorder");
    return pbxprojContent;
  }

  // Categorize phases - use more specific patterns
  const buildPhase = phaseLines.find(line => /Build Node\.js Mobile Native Modules/.test(line));
  const organizePhase = phaseLines.find(line => /Organize Node\.js Native Modules/.test(line));
  const signPhase = phaseLines.find(line => /Sign Node\.js Mobile Native Modules/.test(line));
  const otherPhases = phaseLines.filter(line =>
    !/Build Node\.js Mobile Native Modules/.test(line) &&
    !/Organize Node\.js Native Modules/.test(line) &&
    !/Sign Node\.js Mobile Native Modules/.test(line)
  );

  // Build new ordered list - always enforce order
  const orderedPhases: string[] = [];
  orderedPhases.push(...otherPhases);
  if (buildPhase) orderedPhases.push(buildPhase);
  if (organizePhase) orderedPhases.push(organizePhase);
  if (signPhase) orderedPhases.push(signPhase);

  // Preserve original indentation from first phase
  const indentMatch = phasesSection.match(/^(\s+)/);
  const indent = indentMatch ? indentMatch[1] : '\t\t\t\t';

  // Reconstruct phases section
  const newPhasesSection = orderedPhases.map(line => {
    // Ensure consistent indentation
    const trimmed = line.trim();
    // Preserve trailing comma if it exists, otherwise add one
    const hasComma = trimmed.endsWith(',');
    const cleanLine = hasComma ? trimmed : trimmed + ',';
    return indent + cleanLine;
  }).join('\n');

  const result = pbxprojContent.replace(buildPhasesRegex, `$1${newPhasesSection}\n$3`);

  // Verify the reorder worked by checking if phases are in correct order
  const verifyMatch = result.match(buildPhasesRegex);
  if (verifyMatch) {
    const verifyPhases = verifyMatch[2];
    const buildIndex = verifyPhases.indexOf('Build Node.js Mobile Native Modules');
    const organizeIndex = verifyPhases.indexOf('Organize Node.js Native Modules');
    const signIndex = verifyPhases.indexOf('Sign Node.js Mobile Native Modules');

    if (buildIndex !== -1 && organizeIndex !== -1 && signIndex !== -1) {
      if (buildIndex < organizeIndex && organizeIndex < signIndex) {
        console.log("✓ Build phases verified in correct order");
      } else {
        console.warn(`Warning: Build phases may not be in correct order (Build: ${buildIndex}, Organize: ${organizeIndex}, Sign: ${signIndex})`);
      }
    }
  }

  return result;
}

/**
 * Add build phase to organize .node files after rebuild, before code signing
 * This script should be run after `cap copy` to add the organize build phase
 */
async function addOrganizeBuildPhase() {
  const iosPath = path.join(__dirname, "../App");
  const xcodeprojPath = path.join(iosPath, "App.xcodeproj");
  const pbxprojFile = path.join(xcodeprojPath, "project.pbxproj");

  if (!existsSync(pbxprojFile)) {
    console.error(`Xcode project not found at: ${pbxprojFile}`);
    process.exit(1);
  }

  console.log(`Loading Xcode project from: ${pbxprojFile}`);

  // Load and parse the Xcode project
  const project = xcode.project(pbxprojFile);

  try {
    project.parseSync();
  } catch (error) {
    console.error(`Failed to parse Xcode project: ${error}`);
    process.exit(1);
  }

  // Get the first target (usually "App")
  const target = project.getFirstTarget();
  if (!target) {
    console.error("No targets found in Xcode project");
    process.exit(1);
  }

  console.log(`Using target: ${target.name || target.uuid || "unknown"}`);

  const organizePhaseName = "Organize Node.js Native Modules";

  // Reference the external shell script
  const organizeScript = `set -e
# Add node_modules/.bin to PATH to ensure node-gyp-build and other tools are found
if [ -n "$PROJECT_DIR" ] && [ -d "$PROJECT_DIR/../../node_modules/.bin" ]; then
  export PATH="$PROJECT_DIR/../../node_modules/.bin:$PATH"
fi
# Find and execute organize-node-modules.sh
SCRIPT_PATH="$PROJECT_DIR/../build/organize-node-modules.sh"
if [ ! -f "$SCRIPT_PATH" ]; then
  SCRIPT_PATH="$SRCROOT/../build/organize-node-modules.sh"
fi
if [ ! -f "$SCRIPT_PATH" ]; then
  echo "Error: organize-node-modules.sh not found at $PROJECT_DIR/../build/organize-node-modules.sh or $SRCROOT/../build/organize-node-modules.sh"
  exit 1
fi
bash "$SCRIPT_PATH"`;

  // Check if build phase already exists and update it
  const pbxprojContent = readFileSync(pbxprojFile, "utf8");
  const phaseExists = pbxprojContent.includes(organizePhaseName);

  if (phaseExists) {
    console.log(`Build phase already exists: ${organizePhaseName}`);
    console.log("Updating existing build phase with correct platform-arch detection...");

    // Update using regex - match the entire shellScript field including multiline content
    // Match from name to the closing }; of the build phase
    const phaseRegex = /(name = "Organize Node\.js Native Modules";[\s\S]*?shellScript = ")([\s\S]*?)(";[\s\S]*?};)/;
    const match = pbxprojContent.match(phaseRegex);

    if (match) {
      // Escape quotes, backslashes, and newlines for Xcode format
      const escapedScript = organizeScript.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
      const updatedContent = pbxprojContent.replace(phaseRegex, `$1${escapedScript}$3`);

      // Always reorder build phases after updating
      const reorderedContent = reorderBuildPhases(updatedContent);
      writeFileSync(pbxprojFile, reorderedContent);
      console.log(`Updated build phase: ${organizePhaseName}`);
      console.log(`Reordered build phases: Build -> Organize -> Code Sign`);
      return;
    } else {
      console.log("Build phase script is already up to date");
      // Always reorder to ensure correct order
      const reorderedContent = reorderBuildPhases(pbxprojContent);
      writeFileSync(pbxprojFile, reorderedContent);
      console.log(`Reordered build phases: Build -> Organize -> Code Sign`);
      return;
    }
  }

  // Add the build phase
  try {
    project.addBuildPhase(
      [], // filePathsArray - empty for shell script
      "PBXShellScriptBuildPhase",
      organizePhaseName,
      target.uuid,
      {
        shellScript: organizeScript,
        shellPath: "/bin/sh",
      }
    );

    // Write the updated project file
    const pbxprojContent = project.writeSync();

    // Always reorder build phases to ensure correct order (especially important for CI)
    const reorderedContent = reorderBuildPhases(pbxprojContent);
    writeFileSync(pbxprojFile, reorderedContent);
    console.log(`Added build phase: ${organizePhaseName}`);
    console.log(`Reordered build phases: Build -> Organize -> Code Sign`);
  } catch (error) {
    console.error(`Failed to add build phase ${organizePhaseName}: ${error}`);
    process.exit(1);
  }
}

addOrganizeBuildPhase().catch((error) => {
  console.error(error);
  process.exit(1);
});

