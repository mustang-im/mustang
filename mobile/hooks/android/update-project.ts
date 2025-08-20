import path from "node:path";
import packageJSON from "../../package.json";
import config from "../../capacitor.config";
import { readFile, writeFile } from "node:fs/promises";

const __dirname = import.meta.dirname;
const androidProjectFile = path.join(__dirname, "../../android/app/build.gradle");

async function updateProjectSettings() {
  if (process.env.CAPACITOR_PLATFORM_NAME != "android") return;

  const appId = config.appId;
  const appName = config.appName;
  const version = packageJSON.version;

  // Update the applicationId in build.gradle
  let projectContent = await readFile(androidProjectFile, { encoding: 'utf-8' });
  projectContent = projectContent.replace(/applicationId "[^"]+"/, `applicationId "${appId}"`);

  // Update the version in build.gradle
  projectContent = projectContent.replace(/versionName "[^"]+"/, `versionName "${version}"`);

  // Update the namespace in build.gradle
  projectContent = projectContent.replace(/namespace "[^"]+"/, `namespace "${appId}"`);

  // Update the appName in build.gradle
  projectContent = projectContent.replace(/def appName = "[^"]+"/, `def appName = "${appName}"`);

  await writeFile(androidProjectFile, projectContent);
}

async function main() {
  try {
    await updateProjectSettings();
  } catch (ex) {
    console.error(ex);
  }
}

main();
