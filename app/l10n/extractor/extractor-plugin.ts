import { mkdir, readFile, writeFile } from "fs/promises";
import { dirname, join } from "path";
import { cwd } from "process";
import config from "../config";
import { locales } from "../list";
import { existsSync } from "fs";

export const strings: any[] = [];

export function extractStrings() {
  return {
    name: "extract-strings",
    closeBundle: async() => {
      let sourceFile = config.path.replace("**", config.sourceLocale);
      let existingMessages = JSON.parse((await readFile(join(cwd(), sourceFile))).toString());
      let templateFile = join(dirname(sourceFile), config.templateFile);
      
      let templateJSON = formatMessageDetailed(strings, existingMessages);
      await writeFile(join(cwd(), templateFile), templateJSON);

      let sourceJSON = formatMessageSimple(strings, existingMessages);
      await writeFile(join(cwd(), sourceFile), sourceJSON);

      let localeFiles = locales.map((l) => config.path.replace("**", l));
      for (let file of localeFiles) {
        try {
          let content = (await readFile(file)).toString().trim();
          if (!content) {
            throw new Error("File not found: " + file);
          }
        } catch (ex) {
          let dir = dirname(file);
          if (!existsSync(dirname(file))) {
            await mkdir(dir);
          }
          await writeFile(file, JSON.stringify({}, null, 2));
        }
      }

      let existingKeys = Object.keys(existingMessages);
      let newKeys = Object.keys(JSON.parse(sourceJSON)).filter((k) => existingKeys.includes(k));

      console.log(`${newKeys.length} new strings extracted.`);
    }
  }
}

export function onMessageExtracted(obj: any) {
  strings.push(obj);
}

function formatMessageSimple(messages: any[], existingMessages: any) {
  let msgs = [];
  for (let message of messages) {
    msgs.push({
      id: message.id,
      message: existingMessages[message.id] ?? message.message,
    });
  }
  msgs.sort((a, b) => a.message.localeCompare(b.message));
  let obj = {};
  for (let message of msgs) {
    obj[message.id] = message.message;
  }
  return JSON.stringify(obj, null, 2);
}

function formatMessageDetailed(messages: any[], existingMessages: any){
  let sources = new Set<string>();
  let obj = {};
  for (let message of messages) {
    sources.add(getBaseFileName(message.origin[0]));
  }
  for (let source of sources) {
    let srcMessages = messages.filter(m => getBaseFileName(m.origin[0]) == source);
    let srcObj = {};
    srcMessages.sort((a, b) => a.message.localeCompare(b.message));
    for (let message of srcMessages) {
      srcObj[message.id] = existingMessages[message.id] ?? message.message;
    }
    obj[source] = srcObj;
  }
  return JSON.stringify(obj, null, 2);
}

function getBaseFileName(fileName: string) {
  return fileName.split("/").pop();
}
