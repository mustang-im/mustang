// SPDX-FileCopyrightText: 2024 Mustang GmbH <contact@mustang.im>>
//
// SPDX-License-Identifier: EUPL-1.2

import { MustangApp } from "../AppsBar/MustangApp";
import FilesApp from "../Files/FilesApp.svelte";
import fileShareIcon from '../asset/icon/appBar/fileShare.svg?raw';
import { gt } from "../../l10n/l10n";

export class FilesMustangApp extends MustangApp {
  id = "files";
  name = gt`Files`;
  icon = fileShareIcon;
  mainWindow = FilesApp;
}

export const filesMustangApp = new FilesMustangApp();
