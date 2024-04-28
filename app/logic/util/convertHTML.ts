import DOMPurify from "dompurify"; // https://github.com/cure53/DOMPurify
import TurndownService from "turndown";
import markdownit from "markdown-it";

export function convertHTMLToText(html: string): string {
  return new TurndownService().turndown(sanitizeHTML(html));
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
  return DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
}
