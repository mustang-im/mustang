import { getLocalStorage } from "../../../frontend/Util/LocalStorage";
import { writable, type Readable, type Writable } from "svelte/store";

export interface QuickAccessCommand {
  id: string;
  label: string;
  icon: ConstructorOfATypedSvelteComponent;
  run: () => void | Promise<void>;
  disabled?: Readable<boolean | string>;
  shortCutInfo?: string;
  shownByDefault?: boolean;
}

export type QuickAccessPosition = "above" | "below";

export class QuickAccessToolbar {
  static readonly position = getLocalStorage<QuickAccessPosition>("lookout.qat.position", "above");
  static readonly isHidden = getLocalStorage<boolean>("lookout.qat.hidden", false);
  static readonly chosenIDs = getLocalStorage<string[] | null>("lookout.qat.commands", null);
  static readonly commands: Writable<QuickAccessCommand[]> = writable([]);

  static shown(commands: QuickAccessCommand[], chosenIDs: string[] | null): QuickAccessCommand[] {
    if (!chosenIDs) {
      return commands.filter(command => command.shownByDefault);
    }
    return chosenIDs
      .map(id => commands.find(command => command.id == id))
      .filter(command => command);
  }

  static isShown(command: QuickAccessCommand, chosenIDs: string[] | null): boolean {
    return chosenIDs ? chosenIDs.includes(command.id) : !!command.shownByDefault;
  }

  static toggled(command: QuickAccessCommand, commands: QuickAccessCommand[], chosenIDs: string[] | null): string[] {
    let ids = chosenIDs ?? commands.filter(candidate => candidate.shownByDefault).map(candidate => candidate.id);
    if (ids.includes(command.id)) {
      return ids.filter(id => id != command.id);
    }
    return [...ids, command.id];
  }

  static toggle(command: QuickAccessCommand, commands: QuickAccessCommand[]) {
    QuickAccessToolbar.chosenIDs.value = QuickAccessToolbar.toggled(command, commands, QuickAccessToolbar.chosenIDs.value);
  }

  static setPosition(position: QuickAccessPosition) {
    QuickAccessToolbar.position.value = position;
  }

  static setHidden(hidden: boolean) {
    QuickAccessToolbar.isHidden.value = hidden;
  }
}
