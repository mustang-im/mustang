import emojisJSON from "../../../frontend/Chat/Emoji/emojis.json";

export interface EmojiEntry {
  emoji: string;
  name: string;
  keywords: string[];
}

export interface EmojiCategory {
  id: string;
  title: string;
  icon: string;
  emojis: EmojiEntry[];
}

export class EmojiCatalog {
  static readonly categories: EmojiCategory[] = emojisJSON;

  static search(searchTerm: string, categories = EmojiCatalog.categories): EmojiEntry[] {
    let words = searchTerm?.trim().toLowerCase().split(/\s+/).filter(word => word) ?? [];
    if (!words.length) {
      return [];
    }
    let found: EmojiEntry[] = [];
    for (let category of categories) {
      for (let entry of category.emojis) {
        if (words.every(word => EmojiCatalog.matches(entry, word))) {
          found.push(entry);
        }
      }
    }
    return found;
  }

  protected static matches(entry: EmojiEntry, word: string): boolean {
    return entry.name.toLowerCase().includes(word) ||
      entry.keywords.some(keyword => keyword.toLowerCase().includes(word));
  }
}
