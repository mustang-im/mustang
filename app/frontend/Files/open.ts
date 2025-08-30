import type { File } from "../../logic/Files/File";
import { filesMustangApp } from "./FilesMustangApp";
import { selectedFile } from "./selected";
import { goTo, openApp } from "../AppsBar/selectedApp";
import { appGlobal } from "../../logic/app";

export function openFileFromOtherApp(file: File) {
  selectedFile.set(file);
  if (appGlobal.isMobile) {
    goTo("files/file", { file });
  } else {
    openApp(filesMustangApp, { file });
  }
}
