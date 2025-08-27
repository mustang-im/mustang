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
  if (process.env.CAPACITOR_PLATFORM_NAME != "android") return;

  let androidProjectFile = path.join(__dirname, "../../android/app/build.gradle");
  let gradleContent = await readFile(androidProjectFile, { encoding: 'utf-8' });
  gradleContent = gradleContent.replace(/applicationId "[^"]+"/, `applicationId "${appId}"`);
  gradleContent = gradleContent.replace(/versionName "[^"]+"/, `versionName "${version}"`);
  gradleContent = gradleContent.replace(/namespace "[^"]+"/, `namespace "${appId}"`);
  gradleContent = gradleContent.replace(/def appName = "[^"]+"/, `def appName = "${appName}"`);
  await writeFile(androidProjectFile, gradleContent);
}

// Update the package in the MainActivity java file
async function updateMainActivityPackage() {

  let domainPath = appId?.split('.').join('/');
  let mainDir = "android/app/src/main";

  // Make the package source path to the new plugin Java file
  let newJavaPath = path.resolve(mainDir, `java/${domainPath}`);

  if (!existsSync(newJavaPath)) {
    await mkdir(newJavaPath,  { recursive: true });
  }

  let cliPackage = import.meta.resolve("@capacitor/cli").split(":")[1];
  let templatePath = path.join(cliPackage, "../../assets");
  let templateZip = path.resolve(templatePath, "android-template.tar.gz");
  let templateDir = path.join(templatePath, "android-template");
  let mainActivityFile = path.resolve(templateDir, "app/src/main/java/com/getcapacitor/myapp/MainActivity.java");

  if (!existsSync(templateDir)) {
    await mkdir(templateDir);
  }
  await decompress(templateZip, templateDir);

  let activityPath = path.resolve(newJavaPath, 'MainActivity.java');
  await rm(path.join(mainDir, "java"), { recursive: true });
  await cp(mainActivityFile, activityPath, { recursive: true });

  let activityContent = await readFile(activityPath, { encoding: 'utf-8' });

  activityContent = activityContent.replace(/package ([^;]*)/, `package ${appId}`);
  await writeFile(activityPath, activityContent, { encoding: 'utf-8' });
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
  if (process.env.CAPACITOR_PLATFORM_NAME != "android") return;

  try {
    await Promise.all([
      updateProjectSettings(),
      updateMainActivityPackage(),
    ]);
  } catch (ex) {
    console.error(ex);
  }
}

main();
