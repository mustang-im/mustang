import insane from "insane";

export function convertHTMLToText(html: string): string {
  return html;
}

export function convertTextToHTML(plaintext: string): string {
  return sanitizeHTML(plaintext);
}

export function sanitizeHTML(html: string): string {
  return insane(html, {
  });
}
