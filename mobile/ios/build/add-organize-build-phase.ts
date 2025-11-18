import path from "node:path";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import xcode from "xcode";

const __dirname = import.meta.dirname;

/**
 * Reorder build phases to ensure correct execution order:
 * 1. Build Node.js Mobile Native Modules
 * 2. Organize Node.js Native Modules
 * 3. Code Sign NoSign Node.js Mobile Native Modules
 */
function reorderBuildPhases(pbxprojContent: string): string {
  // Find the buildPhases section for the App target (504EC3031FED79650016851F)
  // Match the exact target UUID and its buildPhases array
  // Structure: 504EC3031FED79650016851F /* App */ = { ... buildPhases = ( ... ); ... }
  const targetUuid = "504EC3031FED79650016851F";
  const targetRegex = new RegExp(
    `(${targetUuid}\\s*\\/\\* App \\*\\/\\s*=\\s*\\{[\\s\\S]*?isa\\s*=\\s*PBXNativeTarget;[\\s\\S]*?buildPhases\\s*=\\s*\\(\\s*)([\\s\\S]*?)(\\s*\\);[\\s\\S]*?name\\s*=\\s*App;)`,
    'm'
  );

  let match = pbxprojContent.match(targetRegex);

  if (!match) {
    console.warn("Could not find App target buildPhases section, skipping reorder");
    return pbxprojContent;
  }

  const phases = match[2];

  // Extract phase references (UUIDs with comments)
  // Format: \t\t\tUUID /* Phase Name */,
  // Handle both with and without trailing comma
  const phaseRegex = /(\s+)([A-F0-9]+)\s*\/\*\s*([^*]+?)\s*\*\/,?\s*/g;
  const phaseList: Array<{ uuid: string; name: string; line: string }> = [];
  let phaseMatch;

  while ((phaseMatch = phaseRegex.exec(phases)) !== null) {
    const fullMatch = phaseMatch[0];
    const uuid = phaseMatch[2];
    const name = phaseMatch[3].trim();
    // Preserve original formatting but ensure trailing comma
    const line = fullMatch.trim().endsWith(',') ? fullMatch.trim() : fullMatch.trim() + ',';
    phaseList.push({
      uuid,
      name,
      line
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
  // Preserve the original indentation style
  const indent = phases.match(/^(\s+)/)?.[1] || '\t\t\t\t';
  const newPhasesText = newPhases.map(p => indent + p).join('\n');
  const newBuildPhases = match[1] + newPhasesText + '\n' + match[3];

  // Replace using the same regex that matched
  const result = pbxprojContent.replace(targetRegex, newBuildPhases);

  // Verify the replacement worked by checking phase count
  const verifyMatch = result.match(targetRegex);
  if (verifyMatch && verifyMatch[2].match(/[A-F0-9]+/g)?.length === newPhases.length) {
    return result;
  } else {
    console.warn("Replacement verification failed, returning original");
    return pbxprojContent;
  }
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
  // Use $PROJECT_DIR to reference the script relative to the Xcode project
  const organizeScript = `bash "$PROJECT_DIR/../build/organize-node-modules.sh"`;

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
      // Escape only newlines and backslashes for Xcode format
      const escapedScript = organizeScript.replace(/\\/g, '\\\\').replace(/\n/g, '\\n');
      const updatedContent = pbxprojContent.replace(phaseRegex, `$1${escapedScript}$3`);

      // Reorder build phases after updating
      const reorderedContent = reorderBuildPhases(updatedContent);
      writeFileSync(pbxprojFile, reorderedContent);
      console.log(`Updated build phase: ${organizePhaseName}`);
      console.log(`Reordered build phases: Build -> Organize -> Code Sign`);
      return;
    } else {
      console.log("Build phase script is already up to date");
      // Still reorder in case order changed
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

    // Skip reordering to avoid corruption - order can be fixed manually in Xcode
    writeFileSync(pbxprojFile, pbxprojContent);
    console.log(`Added build phase: ${organizePhaseName}`);
    console.log(`Note: Build phase order may need manual adjustment in Xcode`);
  } catch (error) {
    console.error(`Failed to add build phase ${organizePhaseName}: ${error}`);
    process.exit(1);
  }
}

addOrganizeBuildPhase().catch((error) => {
  console.error(error);
  process.exit(1);
});

