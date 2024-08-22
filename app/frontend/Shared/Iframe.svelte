<!-- TODO Security: Test that this <iframe> is untrusted and jailed -->
<iframe bind:this={iframeE} src={url} {title} sandbox="allow-scripts" loading="lazy"/>

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
  /** Size the <Iframe> to the size of the content */
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
  body {
    min-height: 0px;
    height: fit-content;
    width: fit-content;
  }
  </style>`;

  const reSizeScript = `<script>
    window.onload = (e) => {
      const body = document.body;
      const html = document.documentElement;
      const width = Math.max( body.scrollWidth, body.offsetWidth, html.clientWidth, html.scrollWidth, html.offsetWidth );
      const height = Math.max( body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight );
      window.parent.postMessage({
        width: width,
        height: height,
      }, "*");
    };
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
  $: iframeE && haveIframe();
  function haveIframe () {
    iframeE.addEventListener("load", () => {
      dispatch("iframe", iframeE);
      if (autoSize) {
        iframeE.addEventListener("load", resizeIframe);
      }
    }, { once: true });
  }

  const widthBuffer = 0;
  const heightBuffer = 0;
  async function resizeIframe () {
    try {
      // console.log(iframeE.contentWindow.document);
      window.addEventListener("message", (e) => {
        console.log(html);
        const dimensions = e.data;
        iframeE.style.width = (dimensions.width + widthBuffer) + "px";
        iframeE.style.height = (dimensions.height + heightBuffer) + "px";
      })
      // iframeE.style.width = (dimensions.width + widthBuffer) + "px";
      // iframeE.style.height = (dimensions.height + heightBuffer) + "px";
    } catch (ex) {
      console.error(ex);
    }
  };
</script>

<style>
  iframe {
    flex: 1 1 0;
    width: 100%;
  }
</style>

