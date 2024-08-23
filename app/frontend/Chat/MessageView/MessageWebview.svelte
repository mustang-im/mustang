{#if !loaded}
  <div bind:this={placeholderE} class="placeholder"></div>
{/if}
{#if loaded}
  <!-- TODO Security: Test that this <webview> is untrusted and jailed -->
  <webview bind:this={webviewE} src={url} {title} />
{/if}

<script lang="ts">
  import { stringToDataURL } from "../../Util/util";
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
  /** Loads only if in view */
  export let lazyLoad = false;
  /** Max width in px for autoSize */
  export let maxWidth: number = 150;
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

  let loaded = !lazyLoad;

  const reSizeCSS = `<style>
    html, body {
      min-height: 0;
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

  $: loaded && webviewE && haveWebView();
  function haveWebView () {
    webviewE.addEventListener("dom-ready", () => {
      dispatch("webview", webviewE);
      if (autoSize) {
        webviewE.addEventListener("did-finish-load", resizeWebview);
      }
    }, { once: true });
  }

  async function resizeWebview () {
    try {
      const dimensions = await webviewE.executeJavaScript(`
        const body = document.body;
        const html = document.documentElement;
        const contentWidth = Math.max( body.scrollLeft, body.scrollWidth, body.offsetWidth, html.clientWidth, html.scrollWidth, html.offsetWidth, body.getBoundingClientRect().width );
        const width = Math.min(${maxWidth}, contentWidth);
        const height = Math.max( body.scrollTop, body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight, body.getBoundingClientRect().height );
        new Promise((resolve) => {
          resolve({
            width: width,
            height: height,
          });
        });
      `);
      webviewE.style.width = (dimensions.width < maxWidth ? "100%" : dimensions.width + "px");
      webviewE.style.height = dimensions.height + "px";
    } catch (ex) {
      console.error(ex);
    }
  };

  let placeholderE: HTMLDivElement;

  $: lazyLoad && placeholderE && startLazy();
  function startLazy() {
    const observer = new IntersectionObserver((entries) => {
      const e = entries[0];
      if (e.isIntersecting) {
        loaded = true;
        observer.unobserve(e.target);
      }
    }, { rootMargin: "100px 0px" });
    try {
      observer.observe(placeholderE);
    } catch (ex) {
      console.error(ex);
    }
  }

  $: lazyLoad && webviewE && startLazyUnload();
  function startLazyUnload() {
    const observer = new IntersectionObserver((entries) => {
      const e = entries[0];
      if (!e.isIntersecting) {
        loaded = false;
        observer.unobserve(e.target);
      }
    });
    try {
      observer.observe(webviewE);
    } catch (ex) {
      console.error(ex);
    }
  }
</script>

<style>
  .placeholder {
    height: 50px;
    max-width: 100%;
  }
  webview {
    flex: 1 0 0;
  }
</style>
