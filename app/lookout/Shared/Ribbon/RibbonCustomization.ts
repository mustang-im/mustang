import { getLocalStorage } from "../../../frontend/Util/LocalStorage";

export interface RibbonHiddenParts {
  tabs: string[];
  groups: string[];
}

export class RibbonCustomization {
  static readonly setting = getLocalStorage<Record<string, RibbonHiddenParts>>("lookout.ribbon.customization", {});

  static groupKey(tabLabel: string, groupLabel: string): string {
    return tabLabel + "/" + groupLabel;
  }

  static hiddenParts(ribbonID: string, all: Record<string, RibbonHiddenParts> = RibbonCustomization.setting.value): RibbonHiddenParts {
    let parts = all?.[ribbonID];
    return { tabs: parts?.tabs ?? [], groups: parts?.groups ?? [] };
  }

  static isTabHidden(ribbonID: string, tabLabel: string, all: Record<string, RibbonHiddenParts> = RibbonCustomization.setting.value): boolean {
    return RibbonCustomization.hiddenParts(ribbonID, all).tabs.includes(tabLabel);
  }

  static isGroupHidden(ribbonID: string, tabLabel: string, groupLabel: string, all: Record<string, RibbonHiddenParts> = RibbonCustomization.setting.value): boolean {
    return RibbonCustomization.hiddenParts(ribbonID, all).groups.includes(RibbonCustomization.groupKey(tabLabel, groupLabel));
  }

  static withHiddenParts(all: Record<string, RibbonHiddenParts>, ribbonID: string, parts: RibbonHiddenParts): Record<string, RibbonHiddenParts> {
    let changed = { ...(all ?? {}) };
    if (parts.tabs.length || parts.groups.length) {
      changed[ribbonID] = { tabs: [...parts.tabs], groups: [...parts.groups] };
    } else {
      delete changed[ribbonID];
    }
    return changed;
  }

  static save(ribbonID: string, parts: RibbonHiddenParts) {
    RibbonCustomization.setting.value = RibbonCustomization.withHiddenParts(RibbonCustomization.setting.value, ribbonID, parts);
  }
}
