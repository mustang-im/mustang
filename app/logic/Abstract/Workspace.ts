// SPDX-FileCopyrightText: 2024 Mustang GmbH <contact@mustang.im>>
//
// SPDX-License-Identifier: EUPL-1.2

import { Observable, notifyChangedProperty } from "../util/Observable";
import WorkIcon from "lucide-svelte/icons/briefcase";
import PrivateIcon from "lucide-svelte/icons/book-heart";
import OtherIcon from "lucide-svelte/icons/shapes";

export class Workspace extends Observable {
  id: string;
  @notifyChangedProperty
  name: string;
  @notifyChangedProperty
  color: string;
  @notifyChangedProperty
  icon: any;

  constructor(name: string, color: string, icon: any) {
    super();
    this.id = name;
    this.name = name;
    this.color = color;
    this.icon = icon;
  }
}

export let workspaces = [
  new Workspace("Work", "lightblue", WorkIcon),
  new Workspace("Private", "lightgreen", PrivateIcon),
  new Workspace("Other", "lightyellow", OtherIcon),
];
