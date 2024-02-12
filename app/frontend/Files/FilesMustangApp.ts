import { MustangApp } from "../AppsBar/MustangApp";
import FilesApp from "../Files/FilesApp.svelte";
import fileShareIcon from '../asset/icon/appBar/fileShare.svg?raw';

export class FilesMustangApp extends MustangApp {
  id = "files";
  name = "Files";
  icon = fileShareIcon;
  mainWindow = FilesApp;
}

export const filesMustangApp = new FilesMustangApp();
