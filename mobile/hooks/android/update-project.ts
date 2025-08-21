import path from "node:path";
import packageJSON from "../../package.json";
import config from "../../capacitor.config";
import { readFile, writeFile } from "node:fs/promises";

const __dirname = import.meta.dirname;

async function updateProjectSettings() {
  if (process.env.CAPACITOR_PLATFORM_NAME != "android") return;

  const appId = config.appId;
  const appName = config.appName;
  const version = packageJSON.version;

  // Update build.gradle
  let androidProjectFile = path.join(__dirname, "../../android/app/build.gradle");
  let gradleContent = await readFile(androidProjectFile, { encoding: 'utf-8' });
  gradleContent = gradleContent.replace(/applicationId "[^"]+"/, `applicationId "${appId}"`);
  gradleContent = gradleContent.replace(/versionName "[^"]+"/, `versionName "${version}"`);
  gradleContent = gradleContent.replace(/namespace "[^"]+"/, `namespace "${appId}"`);
  gradleContent = gradleContent.replace(/def appName = "[^"]+"/, `def appName = "${appName}"`);
  await writeFile(androidProjectFile, gradleContent);

  // Update build.ts
  let appConfigFile = path.join(__dirname, "../../../app/logic/build.ts");
  let appConfigContent = await readFile(appConfigFile, { encoding: 'utf-8' });
  appConfigContent = appConfigContent.replace(/ isMobile = false;/, ` isMobile = true;`);
  await writeFile(appConfigFile, appConfigContent);
}

async function main() {
  try {
    await updateProjectSettings();
  } catch (ex) {
    console.error(ex);
  }
}

main();
