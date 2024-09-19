<!-- TODO Security: Test that this <webview> is untrusted and jailed -->
<webview bind:this={webviewE} src={url} {title} />

<script lang="ts">
  import { stringToDataURL } from "../Util/util";
  import { createEventDispatcher, onMount } from 'svelte';
  const dispatch = createEventDispatcher();

  /**
   * Displays untrusted HTML in a sandboxed iframe which does not allow any JavaScript.
   */

  /** The HTML to display.
   * DANGER Attention: The HTML should already be sanitized using `sanitizeHTML()`
   * Alternative to `url` - set only one of them. */
  export let html: string | null = null;
  /** Insert this into the `<head>` section of the HTML, before display.
   * Optional */
  export let headHTML = "";
  /** The webpage to show.
   * Alternative to `html` - set only one of them. */
  export let url = "";
  /** Tooltip when hovering */
  export let title: string;
  /** Size the <WebView> to the size of the content */
  export let autoSize = false;
  /**
   * Which HTTP servers may be called automatically during the HTML load,
   * e.g. for images, stylesheets etc.?
   * true (default) = `*` any HTTP server on any domain
   * false = `none` = No outgoing calls at all
   * `https://proxy.example.com` = Only allow calls to "https://proxy.example.com/*"
   *
   * This does *not* limit user clicks on links like `<a href="https://...">`.
   */
  export let allowServerCalls: boolean | string = true;

  const autoSizeCSS = `<style>
  body {
    min-height: 0px !important;
    min-width: 100px !important;
    height: fit-content !important;
    width: fit-content !important;
    over-flow: visible !important;
  }
  </style>`;

  onMount(() =>{
    if (autoSize) {
      observeMaxWidth();
    }
  });

  $: html && setURL();
  async function setURL() {
    url = "";
    let displayHTML = html;
    let head = headHTML; /*`<meta http-equiv="Content-Security-Policy" content="default-src '${
      allowServerCalls === true ? "*" : allowServerCalls === false ? "none" : allowServerCalls
    }'">\n\n` + headHTML + `\n\n`; */
    let headPos = displayHTML.indexOf("<head>");
    headPos = headPos < 0 ? 0 : headPos + 6;
    if (autoSize) {
      displayHTML = displayHTML.substring(0, headPos) + head + autoSizeCSS + displayHTML.substring(headPos);
    } else {
      displayHTML = displayHTML.substring(0, headPos) + head + displayHTML.substring(headPos);
    }    
    // console.log("html", displayHTML);
    url = await stringToDataURL("text/html", displayHTML);
  }

  let webviewE: HTMLIFrameElement = null;
  $: webviewE && haveWebView();
  function haveWebView () {
    webviewE.addEventListener("dom-ready", () => {
      dispatch("webview", webviewE);
      if (autoSize) {
        webviewE.addEventListener("did-finish-load", async () => {
          await getContentSize();
          resizeWebview();
        });
      }
    }, { once: true });
  }

  let size;
  async function getContentSize() {
    try {
      size = await webviewE.executeJavaScript(`
        try {
          const body = document.body;
          const styles = window.getComputedStyle(body);
          const width = parseFloat(styles.width);
          const height = Math.max( body.scrollHeight, body.offsetHeight, parseFloat(styles.height) );
          new Promise((resolve) => {
            resolve({
              width: width,
              height: height,
            });
          });
        } catch (ex) {
          new Promise((_, reject) => {
            reject(JSON.stringify(ex));
          });
        }
      `);
    } catch (ex) {
      console.error(ex);
    }
  }

  const heightBuffer = 10;
  let maxWidth: number;
  $: autoSize && size && maxWidth && resizeWebview();
  function resizeWebview() {
    if ((webviewE.parentElement && size.width > webviewE.parentElement.clientWidth) && 
    (!maxWidth || maxWidth && size.width < maxWidth)) {
      webviewE.style.width = size.width + "px";
    }
    if (maxWidth && maxWidth < size.width) {
      webviewE.style.width = maxWidth + "px";
    }
    if (webviewE.parentElement && size.width < webviewE.parentElement.clientWidth) {
      webviewE.style.width = "100%";
    }
    webviewE.style.height = (size.height + heightBuffer) + "px";
  };

  function observeMaxWidth() {
    const parent = parentWithMaxWidth(webviewE);
    const maxWidthVal = getComputedStyle(parent).maxWidth;
    const observer = new ResizeObserver((entries) => {
      const el = entries[0];
      if (maxWidthVal.endsWith("%")) {
        maxWidth = el.contentRect.width * (parseInt(maxWidthVal)/100);
      } else {
        maxWidth = parseInt(maxWidthVal);
      }
    });
    observer.observe(parent.parentElement);
  }

  function parentWithMaxWidth(el: HTMLElement) {
    while (el.parentElement &&
      getComputedStyle(el).maxWidth == "none") {
      el = el.parentElement;
    }
    return el;
  }
</script>

<style>
  webview {
    flex: 1 0 0;
    width: 100%;
    height: auto;
  }
</style>
