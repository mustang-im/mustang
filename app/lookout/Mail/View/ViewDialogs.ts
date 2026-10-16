import type { Folder } from "../../../logic/Mail/Folder";
import { ApplyScope } from "./ViewSettings";
import { writable } from "svelte/store";

export type ViewDialog =
  { kind: "view-settings", folder: Folder | null } |
  { kind: "show-columns", folder: Folder | null } |
  { kind: "apply-view", folder: Folder | null } |
  { kind: "apply-scope", question: string, onChoice: (scope: ApplyScope) => void };

export class ViewDialogs {
  static readonly current = writable<ViewDialog | null>(null);

  static open(dialog: ViewDialog) {
    ViewDialogs.current.set(dialog);
  }

  static close() {
    ViewDialogs.current.set(null);
  }

  static askScope(question: string): Promise<ApplyScope | null> {
    return new Promise(resolve => {
      ViewDialogs.open({
        kind: "apply-scope",
        question,
        onChoice: scope => resolve(scope),
      });
      let unsubscribe = ViewDialogs.current.subscribe(dialog => {
        if (!dialog) {
          resolve(null);
          setTimeout(() => unsubscribe(), 0);
        }
      });
    });
  }
}
