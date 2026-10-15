import type { ContactEntry } from "../../logic/Abstract/Person";
import type { Collection } from "svelte-collections";

export class PreferredEntry {
  static of(entries: Collection<ContactEntry>): ContactEntry | null {
    return entries.sortBy(entry => entry.preference).first ?? null;
  }

  static valueOf(entries: Collection<ContactEntry>): string | null {
    return PreferredEntry.of(entries)?.value || null;
  }
}
