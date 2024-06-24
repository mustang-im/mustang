import { MustangApp } from "../AppsBar/MustangApp";
import FilesApp from "../Files/FilesApp.svelte";
import fileShareIcon from '../asset/icon/appBar/fileShare.svg?raw';
import { gt } from "svelte-i18n-lingui";

export class FilesMustangApp extends MustangApp {
  id = "files";
  name = gt("Files");
  icon = fileShareIcon;
  mainWindow = FilesApp;
}

export const filesMustangApp = new FilesMustangApp();
