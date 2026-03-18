import { Observable, notifyChangedProperty } from "../util/Observable";
import { appGlobal } from "../app";
import { sanitize } from "../../../lib/util/sanitizeDatatypes";
import WorkIcon from "lucide-svelte/icons/briefcase-business";
import PrivateIcon from "lucide-svelte/icons/armchair";
import OtherIcon from "lucide-svelte/icons/circle";
import { gt } from "../../l10n/l10n";

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
    this.icon = icon ?? defaultWorkspaceIcon;
  }
}

export function getWorkspaceByID(workspaceID: string): Workspace | null {
  if (!workspaceID) {
    return null;
  }
  return appGlobal.workspaces.find(w => w.id == sanitize.string(workspaceID, null)) ??
    new Workspace(workspaceID, randomAccountColor(), null);
}

/** Must be called before `getWorkspaceByID()` or `appGlobal.workspaces`
 * TODO Load from SQL? */
export async function loadWorkspaces() {
  if (appGlobal.workspaces.hasItems) {
    return;
  }
  let json: any[] = sanitize.array(JSON.parse(sanitize.nonemptystring(localStorage.getItem("workspaces"), "[]")), []);
  for (let workspaceJSON of json) {
    let name = sanitize.label(workspaceJSON.name);
    let color = sanitize.string(workspaceJSON.color, randomAccountColor());
    let icon = sanitize.string(workspaceJSON.icon, defaultWorkspaceIcon);
    let workspace = new Workspace(name, color, icon);
    appGlobal.workspaces.add(workspace);
  }
  if (appGlobal.workspaces.isEmpty) {
    appGlobal.workspaces.addAll(defaultWorkspaces);
  }
}

export async function saveWorkspaces() {
  let json = appGlobal.workspaces.contents.map(tag => ({
    name: tag.name,
    color: tag.color,
    icon: tag.icon,
  }));
  localStorage.setItem("workspaces", JSON.stringify(json));
}

let defaultWorkspaces = [
  new Workspace(gt`Work`, "lightblue", WorkIcon),
  new Workspace(gt`Private`, "lightgreen", PrivateIcon),
  new Workspace(gt`Other`, "lightyellow", OtherIcon),
];

export let defaultWorkspaceIcon = OtherIcon;

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
