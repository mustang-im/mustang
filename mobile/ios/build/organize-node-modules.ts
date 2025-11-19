/**
 * Organize .node files after rebuilding native modules for iOS
 * node_modules/package/build/Release/*.node -> build/Release/{package}.node/{packageName}
 */

import { existsSync, readFileSync, readdirSync, mkdirSync, copyFileSync, unlinkSync, statSync } from 'node:fs';
import { join, basename, relative } from 'node:path';

const CODESIGNING_FOLDER_PATH = process.env.CODESIGNING_FOLDER_PATH || '';
const PLATFORM_NAME = process.env.PLATFORM_NAME || '';
const ARCHS = process.env.ARCHS || '';

interface NodeFileInfo {
  nodePath: string;
  nodeDir?: string;
  packageName: string;
  isDirectory: boolean;
}

function shouldOrganize(): boolean {
  const pref = process.env.NODEJS_MOBILE_BUILD_NATIVE_MODULES ||
    (CODESIGNING_FOLDER_PATH && existsSync(join(CODESIGNING_FOLDER_PATH, 'nodejs', 'NODEJS_MOBILE_BUILD_NATIVE_MODULES_VALUE.txt'))
      ? readFileSync(join(CODESIGNING_FOLDER_PATH, 'nodejs', 'NODEJS_MOBILE_BUILD_NATIVE_MODULES_VALUE.txt'), 'utf8').trim()
      : '0');
  return pref === '1';
}

function getPlatformArch(): string {
  if (PLATFORM_NAME === 'iphoneos' || PLATFORM_NAME === 'macosx') return 'ios-arm64';
  if (PLATFORM_NAME === 'iphonesimulator') return ARCHS.includes('arm64') ? 'ios-arm64-simulator' : 'ios-x64';
  return 'ios-x64';
}

function getPackageName(nodePath: string, nodeDir: string): string | null {
  const parts = relative(nodeDir, nodePath).split('/');
  const idx = parts.indexOf('node_modules');
  if (idx === -1 || idx === parts.length - 1) return null;
  if (parts[idx + 1]?.startsWith('@')) return `${parts[idx + 1]}/${parts[idx + 2]}`;
  return parts[idx + 1] || null;
}

function findNodeFiles(nodeDir: string): NodeFileInfo[] {
  const results: NodeFileInfo[] = [];
  const nodeModulesPath = join(nodeDir, 'node_modules');
  if (!existsSync(nodeModulesPath)) return results;

  function searchPackage(pkgPath: string): void {
    const buildPath = join(pkgPath, 'build', 'Release');
    if (!existsSync(buildPath)) return;

    try {
      for (const entry of readdirSync(buildPath, { withFileTypes: true })) {
        if (!entry.name.endsWith('.node')) continue;

        const fullPath = join(buildPath, entry.name);
        const packageName = getPackageName(fullPath, nodeDir);
        if (!packageName) continue;

        if (entry.isFile()) {
          try {
            if (statSync(fullPath).size > 0) {
              results.push({ nodePath: fullPath, packageName, isDirectory: false });
            }
          } catch {}
        } else if (entry.isDirectory()) {
          try {
            for (const file of readdirSync(fullPath, { withFileTypes: true })) {
              if (file.isFile() && !file.name.endsWith('.plist') && !file.name.endsWith('.framework')) {
                const execPath = join(fullPath, file.name);
                if (statSync(execPath).size > 0) {
                  results.push({ nodePath: execPath, nodeDir: fullPath, packageName, isDirectory: true });
                  break;
                }
              }
            }
          } catch {}
        }
      }
    } catch {}
  }

  try {
    for (const entry of readdirSync(nodeModulesPath, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const pkgPath = join(nodeModulesPath, entry.name);
      if (entry.name.startsWith('@')) {
        for (const subEntry of readdirSync(pkgPath, { withFileTypes: true })) {
          if (subEntry.isDirectory()) searchPackage(join(pkgPath, subEntry.name));
        }
      } else {
        searchPackage(pkgPath);
      }
    }
  } catch {}

  return results;
}

function organizeFile(info: NodeFileInfo, nodeDir: string): void {
  const nodeName = info.nodeDir ? basename(info.nodeDir) : basename(info.nodePath);
  const targetDir = join(nodeDir, 'build', 'Release', nodeName);
  const targetPath = join(targetDir, info.packageName);

  mkdirSync(targetDir, { recursive: true });
  copyFileSync(info.nodePath, targetPath);
  console.log(`Organized ${info.packageName}: ${info.nodePath} -> ${targetPath}`);

  try {
    if (info.nodeDir) {
      for (const entry of readdirSync(info.nodeDir, { withFileTypes: true })) {
        if (entry.isFile()) unlinkSync(join(info.nodeDir, entry.name));
      }
      try { unlinkSync(info.nodeDir); } catch {}
    } else {
      unlinkSync(info.nodePath);
    }
  } catch {}
}

function main(): void {
  if (!shouldOrganize()) process.exit(0);

  const nodeDir = existsSync(join(CODESIGNING_FOLDER_PATH, 'public', 'nodejs'))
    ? join(CODESIGNING_FOLDER_PATH, 'public', 'nodejs')
    : join(CODESIGNING_FOLDER_PATH, 'nodejs');

  if (!existsSync(nodeDir)) {
    console.warn('Warning: nodejs directory not found, skipping organization');
    process.exit(0);
  }

  console.log(`Organizing native modules for ${getPlatformArch()} in ${nodeDir}`);

  const nodeFiles = findNodeFiles(nodeDir);
  if (nodeFiles.length === 0) {
    console.log('No .node files found to organize');
    process.exit(0);
  }

  console.log(`Found ${nodeFiles.length} .node file(s) to organize`);
  for (const info of nodeFiles) {
    organizeFile(info, nodeDir);
  }

  console.log('Done organizing native modules');
}

main();
