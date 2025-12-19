import path from "node:path";
import packageJSON from "../../package.json" with { type: "json" };
import config from "../../capacitor.config.ts";
import { cp, glob, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";

const __dirname = import.meta.dirname;
const appId = config.appId;
const appName = config.appName;
const version = packageJSON.version;

/**
 *  These settings and files need to be update for the Android Project
 *  based on which are based on the Capacitor CLI.
 *
 * The values in build.gradle and MainActivity.java mainly the ones
 * that use the applicationId must match otherwise the app would crash
 * immediately because it wouldn't find the packages.
 *
 *  @url https://github.com/ionic-team/capacitor/blob/03e92c42d8f1460559dc933c1f79d88be8b9e2bc/cli/src/android/common.ts#L52-L106
 */

/**
 * Updates the variables in build.gradle specifically:
 * - applicationId: this needs to be changed for our Parula branding
 * - versionName: the version of app in string form, also used
 * for the output name
 * - namespace: should be the same as applicationId
 * - appName: the name used for the output file, this needs to be changed for our Parula branding
 *
 * These are settings used to build the Android app.
 */
async function updateBuildGradle() {

  let androidProjectFile = path.join(__dirname, "../../android/app/build.gradle");
  let gradleContent = await readFile(androidProjectFile, { encoding: 'utf-8' });
  gradleContent = gradleContent.replace(/applicationId "[^"]+"/, `applicationId "${appId}"`);
  gradleContent = gradleContent.replace(/versionName "[^"]+"/, `versionName "${version}"`);
  gradleContent = gradleContent.replace(/namespace "[^"]+"/, `namespace "${appId}"`);
  gradleContent = gradleContent.replace(/def appName = "[^"]+"/, `def appName = "${appName}"`);
  await writeFile(androidProjectFile, gradleContent);
}

const mainDir = path.join(__dirname, "../../android/app/src/main");

/**
 * Updates the directory structure and package name in Java files
 *
 * 1. Creates the the directory structure based on the application ID e.g. `/im/mustang/capa`
 * 2. Changes the package name to the appID
 *
 * This is a very important file used by the main process without
 * the directory and package name correctly updated the app would
 * crash immediately.
 */
async function updateJavaPackageName() {

  let domainPath = appId?.split('.').join('/');

  // Rename the directory structure
  let newJavaPath = path.resolve(mainDir, `java/${domainPath}`);

  if (existsSync(path.join(newJavaPath, "MainActivity.java"))) {
    return;
  }

  await mkdir(newJavaPath,  { recursive: true });
  let oldJavaPath = path.resolve(mainDir, "java/im/mustang/capa");

  await cp(oldJavaPath, newJavaPath, { recursive: true });
  await rm(oldJavaPath, { recursive: true });

  for await (const javaFile of glob(`${newJavaPath}/*.java`)) {
    let javaContent = await readFile(javaFile, { encoding: 'utf-8' });
    javaContent = javaContent.replace(/package ([^;]*)/, `package ${appId}`);
    await writeFile(javaFile, javaContent, { encoding: 'utf-8' });
  }
}

/**
 * Updates the strings.xml file. Values updated in this file:
 * - app_name: the display name of the app
 * - title_activity_main: the display name of the app
 * - package_name: the app's unique package identifier
 * - custom_url_scheme: the url scheme that would open the app e.g. `im.mustang.capa://something`.
 * We're not using the custom_url_scheme at the moment.
 *
 * Values in this file are for branding.
 */
async function updateStringsXML() {
  let stringsPath = path.resolve(mainDir, 'res/values/strings.xml');

  let stringsContent = await readFile(stringsPath, { encoding: 'utf-8' });
  stringsContent = stringsContent.replace(/im.mustang.capa/g, appId);
  stringsContent = stringsContent.replace(/Mustang/g, appName);

  await writeFile(stringsPath, stringsContent);
}

async function main() {
  try {
    await Promise.all([
      updateBuildGradle(),
      updateJavaPackageName(),
      updateStringsXML(),
    ]);
  } catch (ex) {
    console.error(ex);
  }
}

main();
