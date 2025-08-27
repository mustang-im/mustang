import { getBaseDomainFromURL } from "./netUtil";
import type { URLString } from "./util";
import DOMPurify from "dompurify"; // https://github.com/cure53/DOMPurify
import { compile as makeHTMLToText } from "html-to-text";
import markdownit from "markdown-it";
import { gt } from "../../l10n/l10n";

let htmlToText: (html: string) => string;

export function convertHTMLToText(html: string): string {
  if (!htmlToText) {
    const options = {
      formatters: {
        removeFormatter: () => { },
      },
      selectors: [
        {
          selector: "img",
          format: "removeFormatter",
        },
        {
          selector: "style",
          format: "removeFormatter",
        },
      ],
    };
    htmlToText = makeHTMLToText(options);
  }
  let text = htmlToText(sanitizeHTML(html));
  return text;
}

let markdownitInstance;
export function convertTextToHTML(plaintext: string): string {
  if (!markdownitInstance) {
    markdownitInstance = markdownit({
      linkify: true,
      breaks: true,
    });
  }
  let html = markdownitInstance.render(plaintext);
  return sanitizeHTML(html);
}

export function fixNewlines(text: string): string {
  return text?.replace(/\r?\n/g, "\r\n");
}

export function sanitizeHTML(html: string): string {
  if (!html) {
    return null;
  }
  includeExternal = false;
  let sanitized = DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ["svg", "mathml"],
    WHOLE_DOCUMENT: true,
  });
  return sanitized;
}

export function sanitizeHTMLExternal(html: string): string {
  if (!html) {
    return null;
  }
  includeExternal = true;
  let sanitized = DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ["svg", "mathml"],
    WHOLE_DOCUMENT: true,
  });
  includeExternal = false;
  return sanitized;
}

// <copied from="https://github.com/cure53/DOMPurify/blob/main/demos/hooks-proxy-demo.html" modified="true" license="Apache 2.0">
const proxy = 'http://localhost:5454/proxy?url=';
const cssURLRegex = /(url\("?)(?!data:)/gim;
const urlAttributes = ['action', 'background', 'href', 'poster', 'src', 'srcset'];

function urlAttribute(url: URLString, includeExternal = false) {
  if (!url) {
    return "";
  }
  if (url.startsWith("data:image/") || url.startsWith("cid:") ||
    includeExternal && (url.startsWith("https://") || url.startsWith("http://"))) {
    return url; // or `${proxy}${escape(url)}`;
  }
  return "";
}

function addStyles(output: string[], styles: CSSStyleDeclaration) {
  for (let style of [...styles].reverse()) {
    if (styles[style]) {
      styles[style] = styles[style].replace(cssURLRegex, `$1${proxy}`);
      output.push(`${style}: ${styles[style]};`);
    }
  }
};

function addCSSRules(output: string[], cssRules: CSSRuleList) {
  for (let rule of [...cssRules].reverse()) {
    if (rule instanceof CSSStyleRule) {
      output.push(`${rule.selectorText} {`);
      if (rule.style) {
        addStyles(output, rule.style);
      }
      output.push('}\n');
    } else if (rule instanceof CSSMediaRule) {
      output.push(`@media ${rule.media.mediaText} {`);
      addCSSRules(output, rule.cssRules);
      output.push('}\n');
    } else if (rule instanceof CSSFontFaceRule) {
      output.push('@font-face {');
      if (rule.style) {
        addStyles(output, rule.style);
      }
      output.push('}\n');
    } else if (rule instanceof CSSKeyframesRule) {
      output.push(`@keyframes ${rule.name} {`);
      for (let frame of [...rule.cssRules].reverse()) {
        if (frame instanceof CSSKeyframeRule && frame.keyText) {
          output.push(`${frame.keyText} {`);
          if (frame.style) {
            addStyles(output, frame.style);
          }
          output.push('}\n');
        }
      }
      output.push('}\n');
    }
  }
};

if (!DOMPurify.addHook) { // for unit tests only. TODO Load it in vitests as well
  DOMPurify.addHook = () => null;
  DOMPurify.sanitize = (html: string) => html;
  console.log("Warning: DOMPurify not loaded. Normal in unit tests, otherwise dangerous.");
}

DOMPurify.addHook('uponSanitizeElement', (node, data) => {
  if (data.tagName === 'style') {
    const output: string[] = [];
    addCSSRules(output, (node as HTMLStyleElement)?.sheet?.cssRules);
    node.textContent = output.join("\n");
  }
});

let includeExternal = false;
DOMPurify.addHook('afterSanitizeAttributes', node => {
  for (let attribute of urlAttributes) {
    if (node.hasAttribute(attribute)) {
      if (node.tagName.toLowerCase() == "a" && attribute == "href") {
        try {
          // New window requests are caught by e2 index.ts setWindowOpenHandler()
          node.setAttribute("target", "_blank");
          let url = node.getAttribute(attribute);
          if (!url) {
            continue;
          }
          let domain = getBaseDomainFromURL(url);
          node.setAttribute("title", domain + "\n\n" + url.substring(0, 120));
        } catch (ex) {
          node.setAttribute(attribute, "");
          node.setAttribute("title", gt`Broken URL`);
        }
      } else if ((node.tagName.toLocaleLowerCase() == "img" && attribute == "src") ||
          (node.tagName.toLocaleLowerCase() == "link" && node.getAttribute("rel") == "stylesheet" && attribute == "href")) {
        let orgURL = node.getAttribute(attribute);
        let newURL = urlAttribute(orgURL, includeExternal);
        node.setAttribute(attribute, newURL);
      } else {
        let orgURL = node.getAttribute(attribute);
        let newURL = urlAttribute(orgURL);
        node.setAttribute(attribute, newURL);
      }
    }
  }

  if (node.hasAttribute('style')) {
    const styles = (node as HTMLElement).style;
    const output = [];
    for (let style of [...styles].reverse()) {
      if (styles[style] && cssURLRegex.test(styles[style])) {
        styles[style] = styles[style].replace(cssURLRegex, `$1${proxy}`);
      }
      output.push(`${style}: ${styles[style]};`);
    }

    node.setAttribute('style', output.join('') || node.removeAttribute('style') || '');
  }
});
// </copied>
