#!/usr/bin/env node
/**
 * Organize .node files after rebuilding native modules for iOS
 *
 * This script finds .node files after they are rebuilt and organizes them into:
 * - {nodeDir}/build/Release/{filename}.node/{packageName} for packages without prebuilds (default)
 * - {packageDir}/prebuilds/{platform}-{arch}/{package}.node/{package} if prebuilds folder exists
 *   (preserves package directory structure so node-gyp-build can find it)
 *
 * Usage: organize-node-files.js <nodeDir> <platform-arch>
 * Example: organize-node-files.js /path/to/nodejs ios-arm64
 */

import { existsSync, readdirSync, statSync, mkdirSync, renameSync, copyFileSync, unlinkSync, rmSync } from 'node:fs';
import { join, dirname, basename, resolve, relative } from 'node:path';

interface NodeFileInfo {
  nodePath: string;
  packageName: string;
  packageDir: string;
  hasPrebuilds: boolean;
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
 * Check if package has prebuilds folder
 */
function hasPrebuildsFolder(packageDir: string): boolean {
  const prebuildsPath = join(packageDir, 'prebuilds');
  return existsSync(prebuildsPath) && statSync(prebuildsPath).isDirectory();
}

/**
 * Find all .node files in node_modules
 * For packages with prebuilds, only include the one matching platformArch
 */
function findNodeFiles(nodeDir: string, platformArch: string): NodeFileInfo[] {
  const nodeFiles: NodeFileInfo[] = [];
  const nodeModulesPath = join(nodeDir, 'node_modules');

  if (!existsSync(nodeModulesPath)) {
    return nodeFiles;
  }

  function searchDirectory(dir: string): void {
    try {
      const entries = readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = join(dir, entry.name);

        if (entry.isDirectory()) {
          // Skip .node directories (they're bundles, not files)
          if (!entry.name.endsWith('.node')) {
            searchDirectory(fullPath);
          }
        } else if (entry.isFile() && entry.name.endsWith('.node')) {
          const packageName = getPackageNameFromPath(fullPath, nodeDir);
          if (packageName) {
            // Find the package root directory
            const relativePath = relative(nodeModulesPath, fullPath);
            const pathParts = relativePath.split('/');
            let packageDir = nodeModulesPath;

            if (pathParts[0]?.startsWith('@')) {
              // Scoped package
              packageDir = join(nodeModulesPath, pathParts[0], pathParts[1]);
            } else {
              packageDir = join(nodeModulesPath, pathParts[0]);
            }

            const hasPrebuilds = hasPrebuildsFolder(packageDir);

            // For prebuilds, only include if it matches the platform-arch
            if (hasPrebuilds) {
              // Check if this .node file is in the correct prebuilds/{platform-arch} directory
              // Also check for darwin-x64+arm64 as it works for ios-arm64
              const isCorrectPlatform = fullPath.includes(`/prebuilds/${platformArch}/`) ||
                (platformArch === 'ios-arm64' && fullPath.includes('/prebuilds/darwin-x64+arm64/'));

              if (isCorrectPlatform) {
                nodeFiles.push({
                  nodePath: fullPath,
                  packageName,
                  packageDir,
                  hasPrebuilds: true,
                });
              }
              // Skip prebuilds for other platforms
            } else {
              // For build/Release, include all .node files
              nodeFiles.push({
                nodePath: fullPath,
                packageName,
                packageDir,
                hasPrebuilds: false,
              });
            }
          }
        }
      }
    } catch (error) {
      // Skip directories we can't read
    }
  }

  searchDirectory(nodeModulesPath);
  return nodeFiles;
}

/**
 * Organize a .node file to its proper location
 */
function organizeNodeFile(
  info: NodeFileInfo,
  nodeDir: string,
  platformArch: string
): void {
  const { nodePath, packageName, packageDir, hasPrebuilds } = info;
  const nodeFileName = basename(nodePath);

  let targetDir: string;
  let targetPath: string;

  if (hasPrebuilds) {
    // Use prebuilds structure: {packageDir}/prebuilds/{platform}-{arch}/{package}.node/{package}
    // This preserves the package directory structure so node-gyp-build can find it
    targetDir = join(packageDir, 'prebuilds', platformArch, `${packageName}.node`);
    targetPath = join(targetDir, packageName);
  } else {
    // Default: build/Release/{filename}.node/{packageName}
    // Create a directory named after the .node file, with the package name as the binary
    targetDir = join(nodeDir, 'build', 'Release', nodeFileName);
    targetPath = join(targetDir, packageName);
  }

  // Create target directory
  mkdirSync(targetDir, { recursive: true });

  // Copy the .node file to the target location
  // (copy instead of move in case it's needed elsewhere)
  copyFileSync(nodePath, targetPath);

  console.log(`Organized ${packageName}: ${nodePath} -> ${targetPath}`);

  // Optionally remove the original if it's in build/Release (not needed after organization)
  if (nodePath.includes('/build/Release/') || nodePath.includes('/build/Debug/')) {
    try {
      unlinkSync(nodePath);
    } catch (error) {
      // Ignore errors removing original
    }
  }
}

/**
 * Clean up prebuilds directories that don't match the current platform-arch
 * This prevents Android prebuilds from being included in iOS builds
 * Now checks both top-level prebuilds and package-level prebuilds
 */
function cleanupOtherPlatformPrebuilds(nodeDir: string, currentPlatformArch: string): void {
  // Clean up top-level prebuilds (legacy location)
  const prebuildsDir = join(nodeDir, 'prebuilds');
  if (existsSync(prebuildsDir)) {
    try {
      const entries = readdirSync(prebuildsDir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const platformArchDir = entry.name;
          // Keep the current platform-arch, remove others (especially android-*)
          if (platformArchDir !== currentPlatformArch &&
              (platformArchDir.startsWith('android-') ||
               (platformArchDir.startsWith('ios-') && platformArchDir !== currentPlatformArch))) {
            const fullPath = join(prebuildsDir, platformArchDir);
            console.log(`Removing top-level prebuilds for other platform: ${platformArchDir}`);
            try {
              // Remove the entire directory
              rmSync(fullPath, { recursive: true, force: true });
            } catch (error) {
              console.warn(`Failed to remove ${fullPath}: ${error instanceof Error ? error.message : String(error)}`);
            }
          }
        }
      }
    } catch (error) {
      // Ignore errors
    }
  }

  // Clean up package-level prebuilds (new location)
  const nodeModulesPath = join(nodeDir, 'node_modules');
  if (existsSync(nodeModulesPath)) {
    try {
      const packages = readdirSync(nodeModulesPath, { withFileTypes: true });
      for (const entry of packages) {
        if (entry.isDirectory()) {
          const packagePrebuildsDir = join(nodeModulesPath, entry.name, 'prebuilds');
          if (existsSync(packagePrebuildsDir)) {
            try {
              const platformDirs = readdirSync(packagePrebuildsDir, { withFileTypes: true });
              for (const platformEntry of platformDirs) {
                if (platformEntry.isDirectory()) {
                  const platformArchDir = platformEntry.name;
                  // Keep the current platform-arch, remove others
                  if (platformArchDir !== currentPlatformArch &&
                      (platformArchDir.startsWith('android-') ||
                       (platformArchDir.startsWith('ios-') && platformArchDir !== currentPlatformArch))) {
                    const fullPath = join(packagePrebuildsDir, platformArchDir);
                    console.log(`Removing package prebuilds for other platform: ${entry.name}/${platformArchDir}`);
                    try {
                      rmSync(fullPath, { recursive: true, force: true });
                    } catch (error) {
                      // Ignore errors
                    }
                  }
                }
              }
            } catch (error) {
              // Ignore errors
            }
          }
        }
      }
    } catch (error) {
      // Ignore errors
    }
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

  // Clean up prebuilds from other platforms (e.g., remove android-* from iOS builds)
  cleanupOtherPlatformPrebuilds(resolvedNodeDir, platformArch);

  const nodeFiles = findNodeFiles(resolvedNodeDir, platformArch);

  if (nodeFiles.length === 0) {
    console.log('No .node files found to organize.');
    return;
  }

  console.log(`Found ${nodeFiles.length} .node file(s) to organize:`);

  for (const info of nodeFiles) {
    try {
      organizeNodeFile(info, resolvedNodeDir, platformArch);
    } catch (error) {
      console.error(`Failed to organize ${info.packageName}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  console.log('Finished organizing .node files.');

  // Clean up node_modules: remove packages without prebuilds, keep those with prebuilds
  // Packages with prebuilds need to keep their directory structure for node-gyp-build
  const nodeModulesPath = join(resolvedNodeDir, 'node_modules');
  if (existsSync(nodeModulesPath)) {
    console.log(`Cleaning up node_modules folder: ${nodeModulesPath}`);
    try {
      const packages = readdirSync(nodeModulesPath, { withFileTypes: true });
      const packagesWithPrebuilds = new Set(
        nodeFiles
          .filter(info => info.hasPrebuilds)
          .map(info => {
            // Extract just the package name (handle scoped packages)
            const relativePath = relative(nodeModulesPath, info.packageDir);
            const parts = relativePath.split('/');
            return parts[0]; // First part is package name or @scope
          })
      );

      for (const entry of packages) {
        if (entry.isDirectory()) {
          const packagePath = join(nodeModulesPath, entry.name);
          const shouldKeep = packagesWithPrebuilds.has(entry.name);

          if (shouldKeep) {
            console.log(`Keeping package with prebuilds: ${entry.name}`);
            // Clean up everything except prebuilds directory
            try {
              const packageContents = readdirSync(packagePath, { withFileTypes: true });
              for (const item of packageContents) {
                const itemPath = join(packagePath, item.name);
                // Keep prebuilds, remove everything else
                if (item.name !== 'prebuilds') {
                  try {
                    if (item.isDirectory()) {
                      rmSync(itemPath, { recursive: true, force: true });
                    } else {
                      unlinkSync(itemPath);
                    }
                  } catch (error) {
                    // Ignore errors
                  }
                }
              }
            } catch (error) {
              // Ignore errors cleaning package contents
            }
          } else {
            // Remove packages without prebuilds
            console.log(`Removing package without prebuilds: ${entry.name}`);
            try {
              rmSync(packagePath, { recursive: true, force: true });
            } catch (error) {
              console.warn(`Failed to remove ${packagePath}: ${error instanceof Error ? error.message : String(error)}`);
            }
          }
        }
      }
      console.log('Finished cleaning up node_modules folder.');
    } catch (error) {
      console.warn(`Failed to clean up node_modules folder: ${error instanceof Error ? error.message : String(error)}`);
    }
  } else {
    console.log('node_modules folder not found, skipping cleanup.');
  }
}

main();

