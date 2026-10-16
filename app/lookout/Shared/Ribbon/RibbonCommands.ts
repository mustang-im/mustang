export interface RibbonCommandEntry {
  label: string;
  tooltip: string;
  tabLabel: string;
  groupLabel: string;
  iconHTML: string;
  disabled: boolean;
  el: HTMLElement;
}

export class RibbonCommands {
  static readonly itemSelector = "button.ribbon-button:not(.part-arrow):not(.group-collapsed-button):not(.more-button), button.launcher, .ribbon-textbox, .ribbon-checkbox";

  static collect(ribbonEl: HTMLElement): RibbonCommandEntry[] {
    let entries: RibbonCommandEntry[] = [];
    let seen = new Set<string>();
    for (let content of Array.from(ribbonEl.querySelectorAll<HTMLElement>(".ribbon-tab-content"))) {
      let tabLabel = content.getAttribute("aria-label") ?? "";
      for (let el of Array.from(content.querySelectorAll<HTMLElement>(RibbonCommands.itemSelector))) {
        let entry = RibbonCommands.entry(el, tabLabel);
        let key = [entry.tabLabel, entry.groupLabel, entry.label].join("\n");
        if (!entry.label || seen.has(key)) {
          continue;
        }
        seen.add(key);
        entries.push(entry);
      }
    }
    return entries;
  }

  protected static entry(el: HTMLElement, tabLabel: string): RibbonCommandEntry {
    let input = el.querySelector("input");
    let label = el.classList.contains("ribbon-textbox")
      ? input?.getAttribute("aria-label")
      : el.classList.contains("ribbon-checkbox")
        ? el.textContent
        : el.getAttribute("aria-label") || el.textContent;
    let groupEl = el.closest<HTMLElement>(".ribbon-group");
    return {
      label: (label ?? "").replace(/\s+/g, " ").trim(),
      tooltip: el.getAttribute("title") ?? "",
      tabLabel,
      groupLabel: groupEl?.getAttribute("aria-label") ?? "",
      iconHTML: el.querySelector(".icon svg")?.outerHTML ?? "",
      disabled: !!(el as HTMLButtonElement).disabled || !!input?.disabled,
      el,
    };
  }

  static search<T extends Pick<RibbonCommandEntry, "label" | "tooltip" | "groupLabel" | "tabLabel">>(entries: T[], searchTerm: string, max = 10): T[] {
    let term = searchTerm?.trim().toLowerCase();
    if (!term) {
      return [];
    }
    let scored = entries
      .map((entry, index) => ({ entry, index, score: RibbonCommands.score(entry, term) }))
      .filter(scoredEntry => scoredEntry.score > 0);
    scored.sort((a, b) => b.score - a.score || a.index - b.index);
    let labels = new Set<string>();
    let results: T[] = [];
    for (let { entry } of scored) {
      let key = entry.label.toLowerCase();
      if (labels.has(key)) {
        continue;
      }
      labels.add(key);
      results.push(entry);
      if (results.length >= max) {
        break;
      }
    }
    return results;
  }

  protected static score(entry: Pick<RibbonCommandEntry, "label" | "tooltip" | "groupLabel" | "tabLabel">, term: string): number {
    let label = entry.label.toLowerCase();
    if (label == term) {
      return 100;
    }
    if (label.startsWith(term)) {
      return 80;
    }
    if (label.split(/[\s/]+/).some(word => word.startsWith(term))) {
      return 60;
    }
    if (label.includes(term)) {
      return 40;
    }
    if (entry.tooltip.toLowerCase().includes(term)) {
      return 20;
    }
    if (entry.groupLabel.toLowerCase().includes(term) || entry.tabLabel.toLowerCase().includes(term)) {
      return 10;
    }
    return 0;
  }
}
