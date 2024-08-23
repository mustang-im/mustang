{#if !loaded}
  <div bind:this={placeholderE} class="placeholder"></div>
{/if}
{#if loaded}
  <!-- TODO Security: Test that this <webview> is untrusted and jailed -->
  <iframe bind:this={iframeE} src={url} {title} />
{/if}

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
  /** Size the <Iframe> to the size of the content */
  export let autoSize = false;
  /** Lazy load iframe */
  export let lazyLoad = false;
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

  let loaded = lazyLoad ? false : true;

  const origin = window.origin;

  const reSizeCSS = `<style>
  body {
    min-height: 0px;
    height: fit-content;
    width: fit-content;
  }
  </style>`;

  const reSizeScript = `<script>
    window.onload = () => {
      window.addEventListener("message", (e) => {
        if (e.origin == "${origin}" && e.data == "dimensions") {
          const body = document.body;
          const html = document.documentElement;
          const width = Math.max( body.scrollWidth, body.offsetWidth, html.clientWidth, html.scrollWidth, html.offsetWidth );
          const height = Math.max( body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight );
          window.parent.postMessage({
            width: width,
            height: height,
          }, "${origin}");
        }
      });
    }
  <\/script>`; 
  $: html && setURL();
  async function setURL() {
    url = "";
    let displayHTML = html;
    let head = headHTML; /*`<meta http-equiv="Content-Security-Policy" content="default-src '${
      allowServerCalls === true ? "*" : allowServerCalls === false ? "none" : allowServerCalls
    }'">\n\n` + headHTML + `\n\n`; */
    let headPos = displayHTML.indexOf("<head>");
    headPos = headPos < 0 ? 0 : headPos + 6;
    displayHTML = displayHTML.substring(0, headPos) + head + reSizeCSS + displayHTML.substring(headPos) + reSizeScript;
    // console.log("html", displayHTML);
    url = await stringToDataURL("text/html", displayHTML);
  }

  let iframeE: HTMLIFrameElement = null;

  $: loaded && iframeE && haveWebView();
  function haveWebView () {
    iframeE.addEventListener("load", () => {
      dispatch("iframe", iframeE);
      if (autoSize) {
        resizeWebview();
      }
    }, { once: true });
  }

  async function resizeWebview () {
    try {
      iframeE.contentWindow.postMessage("dimensions", "*");
      window.addEventListener("message", (e) => {
        const dimensions = e.data;
        if (iframeE) {
          iframeE.style.width = dimensions.width + "px";
          iframeE.style.height = dimensions.height + "px";          
        }
      });
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

  $: lazyLoad && iframeE && startLazyUnload();
  function startLazyUnload() {
    const observer = new IntersectionObserver((entries) => {
      const e = entries[0];
      if (!e.isIntersecting) {
        loaded = false;
        observer.unobserve(e.target);
      }
    });
    try {
      observer.observe(iframeE);
    } catch (ex) {
      console.error(ex);
    }
  }
</script>

<style>
  iframe {
    flex: 1 1 0;
    width: 100%;
  }
</style>

