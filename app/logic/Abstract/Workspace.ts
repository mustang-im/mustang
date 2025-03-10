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
    this.color = color ?? randomAccountColor();
    this.icon = icon;
  }
}

export let workspaces = [
  new Workspace("Work", "lightblue", WorkIcon),
  new Workspace("Private", "lightgreen", PrivateIcon),
  new Workspace("Other", "lightyellow", OtherIcon),
];

export let accountColors = [
  "#F6CC41", // yellow
  "#1FA89A", // turquoise
  "#1E7296", // light blue
  "#E56D0B", // orange
  "#8CCA3B", // light green
  "#19417C", // blue
  "#DEB6C5", // pink
  "#2E7815", // dark green
  "#B20000", // red
  "#32256A", // dark blue
];

export function randomAccountColor() {
  return accountColors[Math.floor(Math.random() * accountColors.length)];
}
