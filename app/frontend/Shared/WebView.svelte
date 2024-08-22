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

  const reSizeCSS = `<style>
    html, body {
      min-Height: 0;
      height: fit-content;
      width: fit-content;
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
    displayHTML = displayHTML.substring(0, headPos) + head + reSizeCSS + displayHTML.substring(headPos);
    // console.log("html", displayHTML);
    url = await stringToDataURL("text/html", displayHTML);
  }

  let webviewE: HTMLIFrameElement = null;
  $: webviewE && haveWebView();
  function haveWebView () {
    webviewE.addEventListener("dom-ready", () => {
      dispatch("webview", webviewE);
      if (autoSize) {
        webviewE.addEventListener("did-finish-load", resizeWebview());
      }
    }, { once: true });
  }

  async function resizeWebview () {
    try {
      const dimensions = await webviewE.executeJavaScript(`
        const body = document.body;
        const html = document.documentElement;
        const width = Math.max( body.scrollLeft, body.scrollWidth, body.offsetWidth, html.clientWidth, html.scrollWidth, html.offsetWidth );
        const height = Math.max( body.scrollTop, body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight );
        new Promise((resolve) => {
          resolve({
            width: width,
            height: height
          });
        });
      `);
      webviewE.style.width = dimensions.width + "px";
      webviewE.style.height = dimensions.height + "px";
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
