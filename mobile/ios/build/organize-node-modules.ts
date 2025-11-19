/**
 * Organize .node files: node_modules/package/build/Release/*.node -> build/Release/{package}.node/{packageName}
 */

import { existsSync, readFileSync, readdirSync, mkdirSync, copyFileSync, unlinkSync, statSync } from 'node:fs';
import { join, basename, relative } from 'node:path';

const CODESIGNING_FOLDER_PATH = process.env.CODESIGNING_FOLDER_PATH || '';

function getPackageName(filePath: string, baseDir: string): string | null {
  const parts = relative(baseDir, filePath).split('/');
  const idx = parts.indexOf('node_modules');
  if (idx === -1 || idx === parts.length - 1) return null;

  // Handle scoped packages (@scope/package)
  if (parts[idx + 1]?.startsWith('@')) {
    return `${parts[idx + 1]}/${parts[idx + 2]}`;
  }
  return parts[idx + 1] || null;
}

function findNodeFiles(nodeDir: string): Array<{ path: string; dir?: string; pkg: string }> {
  const results: Array<{ path: string; dir?: string; pkg: string }> = [];
  const nodeModulesPath = join(nodeDir, 'node_modules');
  if (!existsSync(nodeModulesPath)) return results;

  function searchPackage(packagePath: string): void {
    const releasePath = join(packagePath, 'build', 'Release');
    if (!existsSync(releasePath)) return;

    try {
      for (const entry of readdirSync(releasePath, { withFileTypes: true })) {
        if (!entry.name.endsWith('.node')) continue;

        const entryPath = join(releasePath, entry.name);
        const packageName = getPackageName(entryPath, nodeDir);
        if (!packageName) continue;

        if (entry.isFile() && statSync(entryPath).size > 0) {
          results.push({ path: entryPath, pkg: packageName });
        } else if (entry.isDirectory()) {
          // Directory-based .node (contains executable inside)
          for (const file of readdirSync(entryPath, { withFileTypes: true })) {
            if (file.isFile() && !file.name.endsWith('.plist') && !file.name.endsWith('.framework')) {
              const executablePath = join(entryPath, file.name);
              if (statSync(executablePath).size > 0) {
                results.push({ path: executablePath, dir: entryPath, pkg: packageName });
                break;
              }
            }
          }
        }
      }
    } catch {
      // Skip packages we can't read
    }
  }

  try {
    for (const entry of readdirSync(nodeModulesPath, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;

      if (entry.name.startsWith('@')) {
        // Scoped package: @scope/package
        for (const scopedEntry of readdirSync(join(nodeModulesPath, entry.name), { withFileTypes: true })) {
          if (scopedEntry.isDirectory()) {
            searchPackage(join(nodeModulesPath, entry.name, scopedEntry.name));
          }
        }
      } else {
        searchPackage(join(nodeModulesPath, entry.name));
      }
    }
  } catch {
    // Skip if we can't read node_modules
  }

  return results;
}

function shouldOrganize(): boolean {
  const envValue = process.env.NODEJS_MOBILE_BUILD_NATIVE_MODULES;
  if (envValue === '1') return true;

  if (!CODESIGNING_FOLDER_PATH) return false;

  const prefFile = join(CODESIGNING_FOLDER_PATH, 'nodejs', 'NODEJS_MOBILE_BUILD_NATIVE_MODULES_VALUE.txt');
  return existsSync(prefFile) && readFileSync(prefFile, 'utf8').trim() === '1';
}

function getNodejsDirectory(): string | null {
  if (!CODESIGNING_FOLDER_PATH) return null;

  // Try public/nodejs first (typical Capacitor location)
  const publicPath = join(CODESIGNING_FOLDER_PATH, 'public', 'nodejs');
  if (existsSync(publicPath)) return publicPath;

  // Fallback to nodejs
  const nodejsPath = join(CODESIGNING_FOLDER_PATH, 'nodejs');
  return existsSync(nodejsPath) ? nodejsPath : null;
}

// Main execution
if (!shouldOrganize()) process.exit(0);

const nodeDir = getNodejsDirectory();
if (!nodeDir) {
  console.warn('Warning: nodejs directory not found, skipping organization');
  process.exit(0);
}

const files = findNodeFiles(nodeDir);
if (files.length === 0) {
  console.log('No .node files found to organize');
  process.exit(0);
}

console.log(`Found ${files.length} .node file(s) to organize`);
for (const file of files) {
  const nodeFileName = file.dir ? basename(file.dir) : basename(file.path);
  const targetDir = join(nodeDir, 'build', 'Release', nodeFileName);
  const targetPath = join(targetDir, file.pkg);

  mkdirSync(targetDir, { recursive: true });
  copyFileSync(file.path, targetPath);
  console.log(`Organized ${file.pkg}: ${file.path} -> ${targetPath}`);

  // Clean up source files
  try {
    if (file.dir) {
      for (const f of readdirSync(file.dir, { withFileTypes: true })) {
        if (f.isFile()) unlinkSync(join(file.dir, f.name));
      }
      unlinkSync(file.dir);
    } else {
      unlinkSync(file.path);
    }
  } catch {
    // Ignore cleanup errors
  }
}

console.log('Done organizing native modules');

