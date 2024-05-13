<!-- TODO Security: Test that this <webview> is untrusted and jailed -->
<webview bind:this={webviewE} src={url} {title} />

<script lang="ts">
  import { stringToDataURL } from "../Util/util";

  /**
   * Displays untrusted HTML in a sandboxed iframe which does not allow any JavaScript.
   */

  /** The HTML to display.
   * DANGER Attention: The HTML should already be sanitized using `sanitizeHTML()`
   * Alternative to `url` - set only one of them. */
  export let html: string | null = null;
  /** The webpage to show.
   * Alternative to `html` string - set only one of them. */
  export let url = "";
  /** Tooltip when hovering */
  export let title: string;
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

  $: displayHTML = html /* ? `<meta http-equiv="Content-Security-Policy" content="default-src '${
    allowServerCalls === true ? "*" : allowServerCalls === false ? "none" : allowServerCalls
  }'" /> ` + html : null;*/
  $: displayHTML && setURL(displayHTML);
  async function setURL(_dummy: any) {
    url = "";
    url = await stringToDataURL("text/html", displayHTML);
  }

  let webviewE: HTMLIFrameElement;
</script>

<style>
  webview {
    flex: 1 0 0;
  }
</style>
