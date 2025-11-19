#!/usr/bin/env node
/**
 * Organize .node files after rebuilding native modules for iOS
 *
 * This script finds .node files in node_modules/package/build/Release and organizes them into:
 * - {nodeDir}/build/Release/{filename}.node/{packageName}
 *
 * Usage: organize-node-files.js <nodeDir> <platform-arch>
 * Example: organize-node-files.js /path/to/nodejs ios-arm64
 */

import { existsSync, readdirSync, mkdirSync, copyFileSync, unlinkSync } from 'node:fs';
import { join, basename, resolve, relative } from 'node:path';

interface NodeFileInfo {
  nodePath: string;
  packageName: string;
  packageDir: string;
}

/**
 * Extract package name from node_modules path
 */
function getPackageNameFromPath(nodePath: string, nodeDir: string): string | null {
  // Path format: nodeDir/node_modules/{package}/build/Release/{package}.node
  // or nodeDir/node_modules/{scope}/{package}/build/Release/{package}.node
  const relativePath = relative(nodeDir, nodePath);
  const parts = relativePath.split('/');

  // Find node_modules index
  const nodeModulesIndex = parts.indexOf('node_modules');
  if (nodeModulesIndex === -1 || nodeModulesIndex === parts.length - 1) {
    return null;
  }

  // Get package name (could be scoped like @scope/package)
  if (parts[nodeModulesIndex + 1]?.startsWith('@')) {
    // Scoped package: @scope/package
    return `${parts[nodeModulesIndex + 1]}/${parts[nodeModulesIndex + 2]}`;
  } else {
    // Regular package
    return parts[nodeModulesIndex + 1];
  }
}

/**
 * Find all .node files in node_modules/package/build/Release
 */
function findNodeFiles(nodeDir: string): NodeFileInfo[] {
  const nodeFiles: NodeFileInfo[] = [];
  const nodeModulesPath = join(nodeDir, 'node_modules');

  if (!existsSync(nodeModulesPath)) {
    return nodeFiles;
  }

  function searchPackage(packagePath: string): void {
    const buildReleasePath = join(packagePath, 'build', 'Release');

    if (!existsSync(buildReleasePath)) {
      return;
    }

    try {
      const entries = readdirSync(buildReleasePath, { withFileTypes: true });

      for (const entry of entries) {
        if (entry.isFile() && entry.name.endsWith('.node')) {
          const fullPath = join(buildReleasePath, entry.name);
          const packageName = getPackageNameFromPath(fullPath, nodeDir);

          if (packageName) {
            nodeFiles.push({
              nodePath: fullPath,
              packageName,
              packageDir: packagePath,
            });
          }
        }
      }
    } catch (error) {
      // Skip directories we can't read
    }
  }

  // Search all packages in node_modules
  try {
    const packages = readdirSync(nodeModulesPath, { withFileTypes: true });

    for (const entry of packages) {
      if (entry.isDirectory()) {
        const packagePath = join(nodeModulesPath, entry.name);

        if (entry.name.startsWith('@')) {
          // Scoped package: search inside @scope/package
          try {
            const scopedPackages = readdirSync(packagePath, { withFileTypes: true });
            for (const scopedEntry of scopedPackages) {
              if (scopedEntry.isDirectory()) {
                searchPackage(join(packagePath, scopedEntry.name));
              }
            }
          } catch (error) {
            // Skip scoped packages we can't read
          }
        } else {
          // Regular package
          searchPackage(packagePath);
        }
      }
    }
  } catch (error) {
    // Ignore errors reading node_modules
  }

  return nodeFiles;
}

/**
 * Organize a .node file to its proper location
 */
function organizeNodeFile(
  info: NodeFileInfo,
  nodeDir: string
): void {
  const { nodePath, packageName } = info;
  const nodeFileName = basename(nodePath);

  // Target: build/Release/{filename}.node/{packageName}
  const targetDir = join(nodeDir, 'build', 'Release', nodeFileName);
  const targetPath = join(targetDir, packageName);

  // Create target directory
  mkdirSync(targetDir, { recursive: true });

  // Copy the .node file to the target location
  copyFileSync(nodePath, targetPath);

  console.log(`Organized ${packageName}: ${nodePath} -> ${targetPath}`);

  // Remove the original file from build/Release
  try {
    unlinkSync(nodePath);
  } catch (error) {
    // Ignore errors removing original
  }
}

/**
 * Main function
 */
function main(): void {
  const nodeDir = process.argv[2];
  const platformArch = process.argv[3];

  if (!nodeDir || !platformArch) {
    console.error('Usage: organize-node-files.js <nodeDir> <platform-arch>');
    console.error('Example: organize-node-files.js /path/to/nodejs ios-arm64');
    process.exit(1);
  }

  const resolvedNodeDir = resolve(nodeDir);

  if (!existsSync(resolvedNodeDir)) {
    console.error(`Error: Node.js directory does not exist: ${resolvedNodeDir}`);
    process.exit(1);
  }

  console.log(`Organizing .node files in: ${resolvedNodeDir}`);
  console.log(`Platform-Arch: ${platformArch}`);

  const nodeFiles = findNodeFiles(resolvedNodeDir);

  if (nodeFiles.length === 0) {
    console.log('No .node files found in node_modules/*/build/Release');
    console.log(`Searched in: ${resolvedNodeDir}`);
    return;
  }

  console.log(`Found ${nodeFiles.length} .node file(s) to organize:`);
  for (const info of nodeFiles) {
    console.log(`  - ${info.packageName}: ${info.nodePath}`);
  }

  for (const info of nodeFiles) {
    try {
      organizeNodeFile(info, resolvedNodeDir);
    } catch (error) {
      console.error(`Failed to organize ${info.packageName}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  console.log('Finished organizing .node files.');
}

main();
