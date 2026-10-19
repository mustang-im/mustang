import { getLocalStorage } from "../../../frontend/Util/LocalStorage";
import { gt } from "../../../l10n/l10n";

export interface SymbolSubset {
  name: string;
  ranges: [number, number][];
}

export const recentSymbols = getLocalStorage<string[]>("lookout.mail.compose.recentSymbols", []);

export function symbolSubsets(): SymbolSubset[] {
  return [
    { name: gt`Latin-1 Supplement`, ranges: [[0x00A1, 0x00FF]] },
    { name: gt`Latin Extended-A`, ranges: [[0x0100, 0x017F]] },
    { name: gt`Greek and Coptic`, ranges: [[0x0391, 0x03C9]] },
    { name: gt`Cyrillic`, ranges: [[0x0401, 0x045F]] },
    { name: gt`General Punctuation`, ranges: [[0x2010, 0x2027], [0x2030, 0x205E]] },
    { name: gt`Currency Symbols`, ranges: [[0x20A0, 0x20C0]] },
    { name: gt`Letterlike Symbols`, ranges: [[0x2100, 0x214F]] },
    { name: gt`Number Forms`, ranges: [[0x2150, 0x218B]] },
    { name: gt`Arrows`, ranges: [[0x2190, 0x21FF]] },
    { name: gt`Mathematical Operators`, ranges: [[0x2200, 0x22FF]] },
    { name: gt`Box Drawing`, ranges: [[0x2500, 0x257F]] },
    { name: gt`Geometric Shapes`, ranges: [[0x25A0, 0x25FF]] },
    { name: gt`Miscellaneous Symbols`, ranges: [[0x2600, 0x26FF]] },
    { name: gt`Dingbats`, ranges: [[0x2701, 0x27BF]] },
  ];
}

export function specialCharacters(): { character: string, name: string }[] {
  return [
    { character: "—", name: gt`Em Dash` },
    { character: "–", name: gt`En Dash` },
    { character: "‑", name: gt`Nonbreaking Hyphen` },
    { character: "­", name: gt`Optional Hyphen` },
    { character: " ", name: gt`Em Space` },
    { character: " ", name: gt`En Space` },
    { character: " ", name: gt`1/4 Em Space` },
    { character: " ", name: gt`Nonbreaking Space` },
    { character: "©", name: gt`Copyright` },
    { character: "®", name: gt`Registered` },
    { character: "™", name: gt`Trademark` },
    { character: "§", name: gt`Section` },
    { character: "¶", name: gt`Paragraph` },
    { character: "…", name: gt`Ellipsis` },
    { character: "‘", name: gt`Single Opening Quote` },
    { character: "’", name: gt`Single Closing Quote` },
    { character: "“", name: gt`Double Opening Quote` },
    { character: "”", name: gt`Double Closing Quote` },
    { character: "​", name: gt`No-Width Optional Break` },
    { character: "⁠", name: gt`No-Width Non Break` },
  ];
}

export function subsetCharacters(subset: SymbolSubset): string[] {
  let characters: string[] = [];
  for (let [from, to] of subset.ranges) {
    for (let code = from; code <= to; code++) {
      let character = String.fromCodePoint(code);
      if (/[\p{Cn}\p{Cc}\p{Cf}\p{Zs}]/u.test(character)) {
        continue;
      }
      characters.push(character);
    }
  }
  return characters;
}

export function symbolSubsetOf(character: string): SymbolSubset | null {
  let code = character.codePointAt(0);
  return symbolSubsets().find(subset =>
    subset.ranges.some(([from, to]) => code >= from && code <= to)) ?? null;
}

export function symbolGallery(): string[] {
  const kGallerySize = 20;
  const kCommon = ["€", "£", "¥", "©", "®", "™", "±", "≠", "≤", "≥", "÷", "×", "∞", "µ", "α", "β", "π", "Ω", "∑", "☺"];
  let recent = recentSymbols.value ?? [];
  return [...new Set([...recent, ...kCommon])].slice(0, kGallerySize);
}

export function characterCode(character: string): string {
  return character.codePointAt(0).toString(16).toUpperCase().padStart(4, "0");
}

export function noteSymbolUsed(character: string) {
  const kRecentSize = 20;
  let recent = (recentSymbols.value ?? []).filter(existing => existing != character);
  recentSymbols.value = [character, ...recent].slice(0, kRecentSize);
}
