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

  $: html && setURL();
  async function setURL() {
    url = "";
    let displayHTML = html;
    let head = headHTML; /*`<meta http-equiv="Content-Security-Policy" content="default-src '${
      allowServerCalls === true ? "*" : allowServerCalls === false ? "none" : allowServerCalls
    }'">\n\n` + headHTML + `\n\n`; */
    let headPos = displayHTML.indexOf("<head>");
    headPos = headPos < 0 ? 0 : headPos + 6;
    displayHTML = displayHTML.substring(0, headPos) + head + displayHTML.substring(headPos);
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
        document.body.style.minHeight = "0px";
        document.body.style.height = "fit-content";
        document.body.style.width = "fit-content";
        new Promise(resolve => {
          const observer = new ResizeObserver(entries => {
            const contentRect = entries[0].borderBoxSize[0];
            resolve({
              width: contentRect.inlineSize,
              height: contentRect.blockSize,
            });
          });
          observer.observe(document.body);
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
