import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// 1. Setup Paths and Variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../..');

// Load configurations
const pkg = JSON.parse(await fs.readFile(path.join(ROOT_DIR, 'package.json'), 'utf8'));
const VERSION = pkg.version;

const capConfigContent = await fs.readFile(path.join(ROOT_DIR, 'capacitor.config.ts'), 'utf8');
const APP_ID = capConfigContent.match(/appId:\s*['"]([^'"]+)['"]/)?.[1];
const APP_NAME = capConfigContent.match(/appName:\s*['"]([^'"]+)['"]/)?.[1];

if (!APP_ID || !APP_NAME) {
  console.error("Error: Could not extract appId or appName from capacitor.config.ts");
  process.exit(1);
}

const JNI_PATH = APP_ID.replace(/\./g, '/');
const ANDROID_DIR = path.join(ROOT_DIR, 'android', 'app');
const MAIN_DIR = path.join(ANDROID_DIR, 'src', 'main');
const JAVA_SRC_DIR = path.join(MAIN_DIR, 'java');
const CPP_SRC_DIR = path.join(MAIN_DIR, 'cpp');

/**
 * Updated Recursive walker with skip logic
 * @param {string} dir directory to search
 * @param {string} excludePattern string pattern to skip
 */
async function walk(dir, excludePattern = null) {
  if (!existsSync(dir)) return [];

  // If the current directory itself matches the exclude pattern, skip it entirely
  if (excludePattern && dir.includes(excludePattern)) return [];

  const files = await fs.readdir(dir, { withFileTypes: true });
  const paths = await Promise.all(files.map((file) => {
    const res = path.join(dir, file.name);
    return file.isDirectory() ? walk(res, excludePattern) : res;
  }));
  return paths.flat();
}

// Task 2: Update build.gradle
async function updateBuildGradle() {
  const file = path.join(ANDROID_DIR, 'build.gradle');
  if (!existsSync(file)) return;
  let content = await fs.readFile(file, 'utf8');
  content = content
    .replace(/applicationId "[^"]*"/g, `applicationId "${APP_ID}"`)
    .replace(/versionName "[^"]*"/g, `versionName "${VERSION}"`)
    .replace(/namespace "[^"]*"/g, `namespace "${APP_ID}"`)
    .replace(/def appName = "[^"]*"/g, `def appName = "${APP_NAME}"`);
  await fs.writeFile(file, content);
  console.log("✓ Updated build.gradle");
}

// Task 3: Update Kotlin Files
async function updateKotlinFiles() {
  const files = (await walk(JAVA_SRC_DIR)).filter(f => f.endsWith('.kt'));
  await Promise.all(files.map(async (file) => {
    let content = await fs.readFile(file, 'utf8');
    content = content.replace(/^package [^;\n]*/m, `package ${APP_ID}`);
    await fs.writeFile(file, content);
  }));
  if (files.length) console.log(`✓ Updated ${files.length} Kotlin files`);
}

// Task 4: Update C++ Files
async function updateCppFiles() {
  const OLD_JNI_PREFIX = "im/mustang/capa";
  // We pass 'libnode/cpp' as the exclusion pattern
  const files = (await walk(CPP_SRC_DIR, 'libnode')).filter(f => f.endsWith('.cpp') || f.endsWith('.h'));

  await Promise.all(files.map(async (file) => {
    let content = await fs.readFile(file, 'utf8');
    if (content.includes(OLD_JNI_PREFIX)) {
      content = content.split(OLD_JNI_PREFIX).join(JNI_PATH);
      await fs.writeFile(file, content);
    }
  }));
  if (files.length) console.log(`✓ Updated ${files.length} C++ source files`);
}

// Task 5: Update strings.xml
async function updateStringsXml() {
  const file = path.join(MAIN_DIR, 'res', 'values', 'strings.xml');
  if (!existsSync(file)) return;
  let content = await fs.readFile(file, 'utf8');
  content = content
    .replace(/name="app_name">[^<]*/g, `name="app_name">${APP_NAME}`)
    .replace(/name="title_activity_main">[^<]*/g, `name="title_activity_main">${APP_NAME}`)
    .replace(/com\.getcapacitor\.myapp/g, APP_ID);
  await fs.writeFile(file, content);
  console.log("✓ Updated strings.xml");
}

// Task 6: Move Directories
async function renameDirectories() {
  const oldPath = path.join(JAVA_SRC_DIR, 'im', 'mustang', 'capa');
  const newPath = path.join(JAVA_SRC_DIR, JNI_PATH);

  if (existsSync(oldPath) && oldPath !== newPath) {
    await fs.mkdir(newPath, { recursive: true });
    const files = await fs.readdir(oldPath);
    await Promise.all(files.map(file =>
      fs.rename(path.join(oldPath, file), path.join(newPath, file))
    ));
    await fs.rm(path.join(JAVA_SRC_DIR, 'im'), { recursive: true, force: true });
    console.log(`✓ Directories moved to ${JNI_PATH}`);
  }
}

try {
  await Promise.all([
    updateBuildGradle(),
    updateKotlinFiles(),
    updateCppFiles(),
    updateStringsXml()
  ]);

  await renameDirectories();

  console.log("Project successfully updated.");
} catch (error) {
  console.error("Update failed:", error.stack);
  process.exit(1);
}
