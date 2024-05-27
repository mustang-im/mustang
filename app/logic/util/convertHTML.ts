import { getBaseDomainFromHost } from "./netUtil";
import DOMPurify from "dompurify"; // https://github.com/cure53/DOMPurify
import { convert as htmlToText } from "html-to-text";
import markdownit from "markdown-it";

export function convertHTMLToText(html: string): string {
  return htmlToText(sanitizeHTML(html), {
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
  });
}

let markdownitInstance;
export function convertTextToHTML(plaintext: string): string {
  if (!markdownitInstance) {
    markdownitInstance = markdownit({
      linkify: true,
      break: true,
    });
  }
  let html = markdownitInstance.render(plaintext);
  return sanitizeHTML(html);
}

export function sanitizeHTML(html: string): string {
  if (!html) {
    return null;
  }
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ["svg", "mathml"],
    WHOLE_DOCUMENT: true,
  });
}


// <copied from="https://github.com/cure53/DOMPurify/blob/main/demos/hooks-proxy-demo.html" modified="true" license="Apache 2.0">
const proxy = 'http://localhost:5454/proxy?url=';
const cssURLRegex = /(url\("?)(?!data:)/gim;
const urlAttributes = ['action', 'background', 'href', 'poster', 'src', 'srcset'];

function urlAttribute(url) {
  return /^data:image\//.test(url)
    ? url
    // : `${proxy}${escape(url)}`;
    : "";
}

function addStyles(output, styles) {
  for (let style of [...styles].reverse()) {
    if (styles[style]) {
      styles[style] = styles[style].replace(cssURLRegex, `$1${proxy}`);
      output.push(`${style}: ${styles[style]};`);
    }
  }
};

function addCSSRules(output, cssRules) {
  for (let rule of [...cssRules].reverse()) {
    switch (rule.type) {
      case CSSRule.STYLE_RULE:
        output.push(`${rule.selectorText} {`);
        if (rule.style) {
          addStyles(output, rule.style);
        }
        output.push('}\n');
        break;
      case CSSRule.MEDIA_RULE:
        output.push(`@media ${rule.media.mediaText} {`);
        addCSSRules(output, rule.cssRules);
        output.push('}\n');
        break;
      case CSSRule.FONT_FACE_RULE:
        output.push('@font-face {');
        if (rule.style) {
          addStyles(output, rule.style);
        }
        output.push('}\n');
        break;
      case CSSRule.KEYFRAMES_RULE:
        output.push(`@keyframes ${rule.name} {`);
        for (let frame of [...rule.cssRules].reverse()) {
          if (frame.type === CSSRule.KEYFRAME_RULE && frame.keyText) {
            output.push(`${frame.keyText} {`);
            if (frame.style) {
              addStyles(output, frame.style);
            }
            output.push('}\n');
          }
        }
        output.push('}\n');
        break;
      default:
        break;
    }
  }
};

DOMPurify.addHook('uponSanitizeElement', (node, data) => {
  if (data.tagName === 'style') {
    const output = [];
    addCSSRules(output, node.sheet.cssRules);
    node.textContent = output.join("\n");
  }
});

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
          let hostname = new URL(url).hostname;
          let domain = getBaseDomainFromHost(hostname);
          node.setAttribute("title", domain + "\n\n" + url);
        } catch (ex) {
          node.setAttribute(attribute, "");
          node.setAttribute("title", ex.message ?? ex + "");
        }
      } else {
        node.setAttribute(attribute, urlAttribute(node.getAttribute(attribute)));
      }
    }
  }

  if (node.hasAttribute('style')) {
    const styles = node.style;
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
