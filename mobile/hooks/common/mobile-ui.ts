import path from "node:path";
import { readFile, writeFile } from "node:fs/promises";

const __dirname = import.meta.dirname;

async function setMobileUI() {

  // Update build.ts
  let appConfigFile = path.join(__dirname, "../../../app/logic/build.ts");
  let appConfigContent = await readFile(appConfigFile, { encoding: 'utf-8' });
  appConfigContent = appConfigContent.replace(/ isMobile = false;/, ` isMobile = true;`);
  await writeFile(appConfigFile, appConfigContent);
}

async function main() {
  try {
    await setMobileUI();
  } catch (ex) {
    console.error(ex);
  }
}
