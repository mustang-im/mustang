import insane from "insane";
import TurndownService from "turndown";
import markdownit from "markdown-it";

export function convertHTMLToText(html: string): string {
  return new TurndownService().turndown(html);
}

let markdownitInstance;
export function convertTextToHTML(plaintext: string): string {
  if (!markdownitInstance) {
    markdownitInstance = markdownit();
  }
  let html = markdownitInstance.render(plaintext);
  return sanitizeHTML(html);
}

export function sanitizeHTML(html: string): string {
  if (!html) {
    return null;
  }
  //html = html.replaceAll(">", ">\n");
  if (html.startsWith("<!DOCTYPE")) {
    html = html.substring(html.indexOf(">") + 1);
  }
  //console.log("html before", html);
  let result = insane(html, {
    "allowedAttributes": {
      "a": ["href", "name", "target"],
      "iframe": ["allowfullscreen", "frameborder", "src"],
      "img": ["src", "alt", "height", "width"],
      "blockquote": ["cite"],
      "td": ["width", "valign", "align"],
      "font": ["size", "color"],
      "*": ["class", "name", "id", "title", "style", "border"],
    },
    "allowedClasses": {},
    "allowedSchemes": ["cid", "http", "https", "mailto"],
    "allowedTags": [
      "html", "head", "title", "body",  "style",
      "a", "article", "b", "blockquote", "br", "caption", "code", "del", "details", "div", "em",
      "h1", "h2", "h3", "h4", "h5", "h6", "hr", "i", "img", "ins", "kbd", "li", "main", "ol",
      "p", "pre", "section", "span", "strike", "strong", "sub", "summary", "sup", "table",
      "tbody", "td", "th", "thead", "tr", "u", "ul",
      "font",
    ],
    "filter": null,
    "transformText": null,
  });
  //console.log("insane", result);
  return result;
}
