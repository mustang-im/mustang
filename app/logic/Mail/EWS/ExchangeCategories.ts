import type { Tag } from "../../Abstract/Tag";
import { base64ToUint8Array } from "../../util/blob";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";

export interface ExchangeCategory {
  name: string;
  color: number;
}

export const kCategoryColors = [
  "#D6252E", "#F06C15", "#FFCA4C", "#FFFE3D", "#4AB63F",
  "#40BD95", "#859A52", "#3267B8", "#613DB4", "#A34E78",
  "#C4CCDD", "#8C9CBD", "#C4C4C4", "#A5A5A5", "#1C1C1C",
  "#AF1E25", "#B14F0D", "#AB7B05", "#999400", "#35792B",
  "#2E7D64", "#5F6C3A", "#2A5191", "#50328F", "#82375F",
];

export function categoryColorToHex(color: number): string | null {
  return kCategoryColors[color] ?? null;
}

export function hexToCategoryColor(hex: string): number {
  let rgb = hexToRGB(hex);
  if (!rgb) {
    return -1;
  }
  let nearest = -1;
  let nearestDistance = Infinity;
  kCategoryColors.forEach((categoryHex, index) => {
    let distance = hexToRGB(categoryHex).reduce((sum, value, i) => sum + (value - rgb[i]) ** 2, 0);
    if (distance < nearestDistance) {
      nearest = index;
      nearestDistance = distance;
    }
  });
  return nearest;
}

function hexToRGB(hex: string): number[] | null {
  let match = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex ?? "");
  return match ? match.slice(1).map(value => parseInt(value, 16)) : null;
}

export function parseCategoryListXML(base64: string): Document {
  let text = new TextDecoder().decode(base64ToUint8Array(base64));
  let xml = new DOMParser().parseFromString(text, "text/xml");
  if (xml.getElementsByTagName("parsererror").length || xml.documentElement?.localName != "categories") {
    throw new Error("The category list on the server is not valid");
  }
  return xml;
}

export function categoriesFromXML(xml: Document): ExchangeCategory[] {
  return [...xml.documentElement.children]
    .filter(element => element.localName == "category")
    .map(element => ({
      name: sanitize.nonemptylabel(element.getAttribute("name"), null),
      color: sanitize.integerRange(element.getAttribute("color"), -1, kCategoryColors.length - 1, -1),
    }))
    .filter(category => category.name);
}

export function addCategoryToXML(xml: Document | null, tag: Tag): Document {
  let now = new Date().toISOString();
  if (!xml) {
    xml = new DOMParser().parseFromString(`<categories xmlns="CategoryList.xsd" lastSavedSession="0"/>`, "text/xml");
    xml.documentElement.setAttribute("default", tag.name);
  }
  let root = xml.documentElement;
  let category = xml.createElementNS(root.namespaceURI, "category");
  category.setAttribute("name", tag.name);
  category.setAttribute("color", String(hexToCategoryColor(tag.color)));
  category.setAttribute("keyboardShortcut", "0");
  category.setAttribute("usageCount", "0");
  category.setAttribute("lastTimeUsedMail", now);
  category.setAttribute("lastTimeUsed", now);
  category.setAttribute("lastSessionUsed", "0");
  category.setAttribute("guid", `{${crypto.randomUUID().toUpperCase()}}`);
  root.append(category);
  root.setAttribute("lastSavedTime", now);
  return xml;
}

export function categoryListXMLToBase64(xml: Document): string {
  let text = `<?xml version="1.0"?>\n` + new XMLSerializer().serializeToString(xml.documentElement);
  return btoa(unescape(encodeURIComponent(text)));
}
