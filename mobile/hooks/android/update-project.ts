import path from "node:path";
import packageJSON from "../../package.json" with { type: "json" };
import config from "../../capacitor.config.ts";
import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { createReadStream, existsSync } from "node:fs";
import zlib from "node:zlib";
import { extract } from "tar";

const __dirname = import.meta.dirname;
const appId = config.appId;
const appName = config.appName;
const version = packageJSON.version;

/**
 *  These settings and files need to be update for the Android Project
 *  based on which are based on the Capacitor CLI.
 *
 *  @url https://github.com/ionic-team/capacitor/blob/03e92c42d8f1460559dc933c1f79d88be8b9e2bc/cli/src/android/common.ts#L52-L106
 */

// Update build.gradle
async function updateProjectSettings() {

  let androidProjectFile = path.join(__dirname, "../../android/app/build.gradle");
  let gradleContent = await readFile(androidProjectFile, { encoding: 'utf-8' });
  gradleContent = gradleContent.replace(/applicationId "[^"]+"/, `applicationId "${appId}"`);
  gradleContent = gradleContent.replace(/versionName "[^"]+"/, `versionName "${version}"`);
  gradleContent = gradleContent.replace(/namespace "[^"]+"/, `namespace "${appId}"`);
  gradleContent = gradleContent.replace(/def appName = "[^"]+"/, `def appName = "${appName}"`);
  await writeFile(androidProjectFile, gradleContent);
}

const mainDir = path.join(__dirname, "../../android/app/src/main");
let templateDir: string;
async function updateTemplateBasedFiles() {
  await getTemplate();
  await Promise.all([
    updateMainActivityPackage(),
    updateStringsXML(),
  ]);
}

// Get template
async function getTemplate() {
  // vite-node doesn't support import.meta.resolve
  let cliPackage = path.join(__dirname, "../../node_modules/@capacitor/cli");
  let templatePath = path.join(cliPackage, "./assets");
  let templateZip = path.resolve(templatePath, "android-template.tar.gz");
  templateDir = path.join(templatePath, "android-template");

  if (existsSync(templateDir)) {
    await rm(templateDir, { recursive: true });
  }
  await mkdir(templateDir);
  await decompress(templateZip, templateDir);
}

// Update the package in the MainActivity java file
async function updateMainActivityPackage() {

  let domainPath = appId?.split('.').join('/');

  // Make the package source path to the new plugin Java file
  let newJavaPath = path.resolve(mainDir, `java/${domainPath}`);

  if (!existsSync(newJavaPath)) {
    await mkdir(newJavaPath,  { recursive: true });
  }

  let mainActivityFile = path.resolve(templateDir, "app/src/main/java/com/getcapacitor/myapp/MainActivity.java");

  let activityPath = path.resolve(newJavaPath, 'MainActivity.java');
  await rm(path.join(mainDir, "java"), { recursive: true });
  await cp(mainActivityFile, activityPath, { recursive: true });

  let activityContent = await readFile(activityPath, { encoding: 'utf-8' });

  activityContent = activityContent.replace(/package ([^;]*)/, `package ${appId}`);
  await writeFile(activityPath, activityContent, { encoding: 'utf-8' });
}

// Update the settings in res/values/strings.xml
async function updateStringsXML() {
  let stringFile = path.resolve(templateDir, "app/src/main/res/values/strings.xml");
  let stringsPath = path.resolve(mainDir, 'res/values/strings.xml');

  await cp(stringFile, stringsPath, { recursive: true });

  let stringsContent = await readFile(stringsPath, { encoding: 'utf-8' });
  stringsContent = stringsContent.replace(/com.getcapacitor.myapp/g, appId);
  stringsContent = stringsContent.replace(/My App/g, appName);

  await writeFile(stringsPath, stringsContent);
}

async function decompress(source: string, destination: string) {
  return await new Promise((res) => {
    createReadStream(source)
      .pipe(zlib.createGunzip())
      .pipe(extract({ cwd: destination }))
      .on('finish', () => {
        res(null);
      });
  });
}

async function main() {
  try {
    await Promise.all([
      updateProjectSettings(),
      updateTemplateBasedFiles(),
    ]);
  } catch (ex) {
    console.error(ex);
  }
}

main();
