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

  // Match the buildPhases section
  const buildPhasesRegex = new RegExp(
    `(${targetUuid}\\s*\\/\\* App \\*\\/\\s*=\\s*\\{[\\s\\S]*?buildPhases\\s*=\\s*\\()([\\s\\S]*?)(\\s*\\);[\\s\\S]*?name\\s*=\\s*App;)`,
    'm'
  );

  const match = pbxprojContent.match(buildPhasesRegex);
  if (!match) {
    return pbxprojContent;
  }

  const phasesSection = match[2];

  // Extract all phase lines (preserving original formatting)
  const phaseLines = phasesSection.split('\n').filter(line => {
    const trimmed = line.trim();
    return trimmed && /[A-F0-9]+\s*\/\*/.test(trimmed);
  });

  if (phaseLines.length === 0) {
    return pbxprojContent;
  }

  // Categorize phases
  const buildPhase = phaseLines.find(line => /Build Node\.js Mobile Native Modules/.test(line));
  const organizePhase = phaseLines.find(line => /Organize Node\.js Native Modules/.test(line));
  const signPhase = phaseLines.find(line => /Sign Node\.js Mobile Native Modules/.test(line));
  const otherPhases = phaseLines.filter(line =>
    !/Build Node\.js Mobile Native Modules/.test(line) &&
    !/Organize Node\.js Native Modules/.test(line) &&
    !/Sign Node\.js Mobile Native Modules/.test(line)
  );

  // Build new ordered list
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
    return indent + trimmed + (trimmed.endsWith(',') ? '' : ',');
  }).join('\n');

  const result = pbxprojContent.replace(buildPhasesRegex, `$1${newPhasesSection}\n$3`);
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

