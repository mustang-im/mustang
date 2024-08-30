<!-- TODO Security: Test that this <webview> is untrusted and jailed -->
<webview bind:this={webviewE} src={url} {title} />

<script lang="ts">
  import { stringToDataURL } from "../Util/util";
  import { createEventDispatcher } from 'svelte';
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
        webviewE.addEventListener("did-finish-load", resizeWebview);
      }
    }, { once: true });
  }

  const widthBuffer = 20;
  const heightBuffer = 40;
  async function resizeWebview () {
    try {
      const dimensions = await webviewE.executeJavaScript(`
        const html = document.documentElement;
        const body = document.body;
        const bodyStyles = window.getComputedStyle(body);
        const width = parseFloat(bodyStyles.width);
        const height = Math.max( body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight );
        new Promise(resolve => {
          resolve({
            width: width,
            height: height,
          });
        });
      `);
      webviewE.style.width = (dimensions.width + widthBuffer) + "px";
      webviewE.style.height = (dimensions.height + heightBuffer) + "px";
    } catch (ex) {
      console.error(ex);
    }
  };
</script>

<style>
  webview {
    flex: 1 0 0;
  }
</style>
