import path from "node:path";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import xcode from "xcode";

const __dirname = import.meta.dirname;

/**
 * Reorder build phases to ensure correct execution order:
 * 1. Build Node.js Mobile Native Modules
 * 2. Organize Node.js Native Modules
 * 3. Code Sign Node Native Modules / Sign Node.js Mobile Native Modules
 */
function reorderBuildPhases(pbxprojContent: string): string {
  // Find the buildPhases section for the App target
  // Need to match the specific target's buildPhases, not all of them
  // Look for the App target's buildPhases section
  const targetBuildPhasesRegex = /(name = App;\s+isa = PBXNativeTarget;[^}]*buildPhases = \(\s*)([\s\S]*?)(\s*\);)/;

  const match = pbxprojContent.match(targetBuildPhasesRegex);
  if (!match) {
    console.warn("Could not find App target buildPhases section, skipping reorder");
    return pbxprojContent;
  }

  const phases = match[2];

  // Extract phase references (UUIDs with comments)
  // Format: \t\t\tUUID /* Phase Name */,
  const phaseRegex = /(\s+)([A-F0-9]+)\s*\/\*\s*([^*]+)\s*\*\/,?\s*/g;
  const phaseList: Array<{ uuid: string; name: string; line: string }> = [];
  let phaseMatch;

  while ((phaseMatch = phaseRegex.exec(phases)) !== null) {
    const line = phaseMatch[0].trim();
    phaseList.push({
      uuid: phaseMatch[2],
      name: phaseMatch[3].trim(),
      line: line.endsWith(',') ? line : line + ','
    });
  }

  if (phaseList.length === 0) {
    console.warn("No phases found to reorder");
    return pbxprojContent;
  }

  // Separate phases into categories
  const buildPhase = phaseList.find(p => p.name.includes("Build Node.js Mobile Native Modules"));
  const organizePhase = phaseList.find(p => p.name.includes("Organize Node.js Native Modules"));
  const codeSignPhases = phaseList.filter(p =>
    p.name.includes("Code Sign") || p.name.includes("Sign Node.js Mobile Native Modules")
  );
  const otherPhases = phaseList.filter(p =>
    !p.name.includes("Build Node.js Mobile Native Modules") &&
    !p.name.includes("Organize Node.js Native Modules") &&
    !p.name.includes("Code Sign") &&
    !p.name.includes("Sign Node.js Mobile Native Modules")
  );

  // Build new order: other phases -> Build -> Organize -> Code Sign phases
  const newPhases: string[] = [];

  // Add other phases first (Sources, Frameworks, Resources, etc.)
  otherPhases.forEach(p => newPhases.push('\t\t\t\t' + p.line));

  // Add Build phase
  if (buildPhase) {
    newPhases.push('\t\t\t\t' + buildPhase.line);
  }

  // Add Organize phase
  if (organizePhase) {
    newPhases.push('\t\t\t\t' + organizePhase.line);
  }

  // Add Code Sign phases last
  codeSignPhases.forEach(p => newPhases.push('\t\t\t\t' + p.line));

  // Reconstruct the buildPhases section with proper indentation
  const newBuildPhases = match[1] + newPhases.join('\n') + '\n' + match[3];

  return pbxprojContent.replace(targetBuildPhasesRegex, newBuildPhases);
}

/**
 * Add build phase to organize .node files after rebuild, before code signing
 * This script should be run after `cap copy` to add the organize build phase
 */
async function addOrganizeBuildPhase() {
  const iosPath = path.join(__dirname, "../../ios/App");
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

  // Create the shell script for the build phase (needed for both add and update)
  // Use string concatenation to avoid TypeScript parser issues with bash syntax
  const organizeScript = [
    'set -e',
    '# Check if build native modules preference is set',
    'if [ -z "$NODEJS_MOBILE_BUILD_NATIVE_MODULES" ]; then',
    '  PREFERENCE_FILE_PATH="$CODESIGNING_FOLDER_PATH/nodejs/NODEJS_MOBILE_BUILD_NATIVE_MODULES_VALUE.txt"',
    '  if [ -f "$PREFERENCE_FILE_PATH" ]; then',
    '    NODEJS_MOBILE_BUILD_NATIVE_MODULES="$(cat $PREFERENCE_FILE_PATH | xargs)"',
    '  fi',
    'fi',
    '',
    'if [ -z "$NODEJS_MOBILE_BUILD_NATIVE_MODULES" ]; then',
    '  # Check for .node files in node_modules (after rebuild)',
    '  # Try public/nodejs/node_modules first (actual location), then nodejs/node_modules (fallback)',
    '  node_files=($(find "$CODESIGNING_FOLDER_PATH/public/nodejs/node_modules" -name "*.node" -type f 2>/dev/null || find "$CODESIGNING_FOLDER_PATH/nodejs/node_modules" -name "*.node" -type f 2>/dev/null || true))',
    '  if [ ${#node_files[@]} -gt 0 ]; then',
    '    NODEJS_MOBILE_BUILD_NATIVE_MODULES=1',
    '  else',
    '    # Fallback: check for .gyp files',
    '    gypfiles=($(find "$CODESIGNING_FOLDER_PATH/nodejs/" -type f -name "*.gyp" 2>/dev/null || true))',
    '    if [ ${#gypfiles[@]} -gt 0 ]; then',
    '      NODEJS_MOBILE_BUILD_NATIVE_MODULES=1',
    '    else',
    '      NODEJS_MOBILE_BUILD_NATIVE_MODULES=0',
    '    fi',
    '  fi',
    'fi',
    '',
    'if [ "1" != "$NODEJS_MOBILE_BUILD_NATIVE_MODULES" ]; then exit 0; fi',
    '',
    '# Determine platform-arch',
    'PLATFORM_ARCH=""',
    'if [ "$PLATFORM_NAME" == "iphoneos" ]; then',
    '  # iOS device - always arm64',
    '  PLATFORM_ARCH="ios-arm64"',
    'elif [ "$PLATFORM_NAME" == "macosx" ]; then',
    '  # Mac Catalyst (Designed for iPad) - uses ios-arm64 architecture',
    '  PLATFORM_ARCH="ios-arm64"',
    'elif [ "$PLATFORM_NAME" == "iphonesimulator" ]; then',
    '  # iOS Simulator - check architecture',
    '  # ARCHS can be "arm64" or "arm64 x86_64" for universal builds',
    '  if echo "$ARCHS" | grep -q "arm64"; then',
    '    PLATFORM_ARCH="ios-arm64-simulator"',
    '  else',
    '    PLATFORM_ARCH="ios-x64"',
    '  fi',
    'else',
    '  # Fallback to ios-x64 for unknown platforms',
    '  PLATFORM_ARCH="ios-x64"',
    'fi',
    '',
    '# Organize .node files',
    '# Find the script path relative to project root',
    '# PROJECT_DIR is ios/App, so hooks/ios is at ../../hooks/ios',
    'SCRIPT_PATH="${PROJECT_DIR}/../../hooks/ios/organize-node-files.ts"',
    'if [ ! -f "${SCRIPT_PATH}" ]; then',
    '  # Fallback: try from SRCROOT if PROJECT_DIR approach fails',
    '  SCRIPT_PATH="${SRCROOT}/../../hooks/ios/organize-node-files.ts"',
    'fi',
    'if [ ! -f "${SCRIPT_PATH}" ]; then',
    '  echo "Warning: organize-node-files.ts not found, skipping organization"',
    '  exit 0',
    'fi',
    '# Use public/nodejs if it exists, otherwise nodejs',
    'NODEJS_DIR="$CODESIGNING_FOLDER_PATH/public/nodejs"',
    'if [ ! -d "$NODEJS_DIR" ]; then',
    '  NODEJS_DIR="$CODESIGNING_FOLDER_PATH/nodejs"',
    'fi',
    'node --experimental-strip-types "${SCRIPT_PATH}" "$NODEJS_DIR" "$PLATFORM_ARCH" || true'
  ].join('\n');

  // Check if build phase already exists and update it
  const pbxprojContent = readFileSync(pbxprojFile, "utf8");
  const phaseExists = pbxprojContent.includes(organizePhaseName);

  if (phaseExists) {
    console.log(`Build phase already exists: ${organizePhaseName}`);
    console.log("Updating existing build phase with correct platform-arch detection...");

    // Find and update the existing build phase script
    let updatedContent = pbxprojContent.replace(
      /(name = "Organize Node\.js Native Modules";[^}]*shellScript = ")[^"]*(";)/s,
      (match, prefix, suffix) => {
        return prefix + organizeScript.replace(/"/g, '\\"').replace(/\n/g, '\\n') + suffix;
      }
    );

    // Reorder build phases even when updating
    updatedContent = reorderBuildPhases(updatedContent);

    if (updatedContent !== pbxprojContent) {
      writeFileSync(pbxprojFile, updatedContent);
      console.log(`Updated build phase: ${organizePhaseName}`);
      console.log(`Reordered build phases: Build -> Organize -> Code Sign`);
      return;
    } else {
      console.log("Build phase script is already up to date");
      // Still reorder phases in case order changed
      const reorderedContent = reorderBuildPhases(pbxprojContent);
      if (reorderedContent !== pbxprojContent) {
        writeFileSync(pbxprojFile, reorderedContent);
        console.log(`Reordered build phases: Build -> Organize -> Code Sign`);
      }
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

    // Reorder build phases so Organize runs before Code Sign phases
    // The order should be: Build -> Organize -> Code Sign
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

