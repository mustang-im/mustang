#!/usr/bin/env node
/**
 * Organize .node files and directories after rebuilding native modules for iOS
 *
 * This script finds both:
 * - .node files in node_modules/package/build/Release
 * - .node directories in node_modules/package/build/Release (each containing an executable)
 *
 * And organizes them into:
 * - {nodeDir}/build/Release/{package}.node/{packageName}
 *
 * Usage: organize-node-files.js <nodeDir> <platform-arch>
 * Example: organize-node-files.js /path/to/nodejs ios-arm64
 */

import { existsSync, readdirSync, mkdirSync, copyFileSync, unlinkSync, statSync } from 'node:fs';
import { join, basename, resolve, relative } from 'node:path';

interface NodeFileInfo {
  nodePath: string; // Path to the executable (either a .node file or executable inside .node directory)
  nodeDir?: string; // Path to the .node directory (if it's a directory, undefined if it's a file)
  packageName: string;
  packageDir: string;
  isDirectory: boolean; // true if source is a directory, false if it's a file
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
 * Find all .node files and directories in node_modules/package/build/Release
 * Handles both:
 * - .node files (direct files)
 * - .node directories (containing an executable)
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
        if (entry.name.endsWith('.node')) {
          const fullPath = join(buildReleasePath, entry.name);
          const packageName = getPackageNameFromPath(fullPath, nodeDir);

          if (!packageName) {
            continue;
          }

          if (entry.isFile()) {
            // It's a .node file directly - verify it's not empty
            try {
              const fileStat = statSync(fullPath);
              if (fileStat.size > 0) {
                nodeFiles.push({
                  nodePath: fullPath,
                  nodeDir: undefined, // No .node directory when it's just a file
                  packageName,
                  packageDir: packagePath,
                  isDirectory: false,
                });
              }
            } catch (error) {
              // Skip invalid files
              continue;
            }
          } else if (entry.isDirectory()) {
            // It's a .node directory - find the executable inside
            try {
              const nodeDirContents = readdirSync(fullPath, { withFileTypes: true });

              for (const contentEntry of nodeDirContents) {
                // The executable is usually a file (not a directory) and not a plist or framework
                if (contentEntry.isFile() && !contentEntry.name.endsWith('.plist') && !contentEntry.name.endsWith('.framework')) {
                  const executablePath = join(fullPath, contentEntry.name);
                  // Verify it's actually a file and not empty
                  try {
                    const fileStat = statSync(executablePath);
                    if (fileStat.isFile() && fileStat.size > 0) {
                      nodeFiles.push({
                        nodePath: executablePath,
                        nodeDir: fullPath,
                        packageName,
                        packageDir: packagePath,
                        isDirectory: true,
                      });
                      // Only take the first valid executable found in each .node directory
                      break;
                    }
                  } catch (error) {
                    // Skip invalid files
                    continue;
                  }
                }
              }
            } catch (error) {
              // Skip .node directories we can't read
            }
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
 * Organize a .node file or directory to its proper location
 */
function organizeNodeFile(
  info: NodeFileInfo,
  nodeDir: string
): void {
  const { nodePath, nodeDir: sourceNodeDir, packageName, isDirectory } = info;

  // Determine the .node name (either from directory name or file name)
  let nodeDirName: string;
  if (isDirectory && sourceNodeDir) {
    nodeDirName = basename(sourceNodeDir); // e.g., "bufferutil.node"
  } else {
    nodeDirName = basename(nodePath); // e.g., "bufferutil.node"
  }

  // Target: build/Release/{package}.node/{packageName}
  const targetDir = join(nodeDir, 'build', 'Release', nodeDirName);
  const targetPath = join(targetDir, packageName);

  // Create target directory
  mkdirSync(targetDir, { recursive: true });

  // Copy the file/executable to the target location
  copyFileSync(nodePath, targetPath);

  console.log(`Organized ${packageName}: ${nodePath} -> ${targetPath}`);

  // Remove the original from build/Release
  try {
    if (isDirectory && sourceNodeDir) {
      // Remove all files in the original .node directory
      const originalContents = readdirSync(sourceNodeDir, { withFileTypes: true });
      for (const entry of originalContents) {
        const entryPath = join(sourceNodeDir, entry.name);
        if (entry.isFile()) {
          unlinkSync(entryPath);
        }
      }
      // Try to remove the directory (will fail if not empty, but that's okay)
      try {
        unlinkSync(sourceNodeDir);
      } catch (error) {
        // Directory might not be empty, ignore
      }
    } else {
      // It's a file - just remove it
      unlinkSync(nodePath);
    }
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
    console.log('No .node files or directories found in node_modules/*/build/Release');
    console.log(`Searched in: ${resolvedNodeDir}`);
    return;
  }

  console.log(`Found ${nodeFiles.length} .node file(s)/directory/directories to organize:`);
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
