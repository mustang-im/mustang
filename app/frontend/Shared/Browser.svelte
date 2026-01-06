{#if withURLbar}
  <hbox class="toolbar">
    <slot name="urlbar-left" />
    <hbox class="urlbar" flex>
      {getDomain(currentURL)}
    </hbox>
    <hbox class="buttons right">
      <hbox class="loading">
        {#if isLoading}
          <Loader />
        {/if}
      </hbox>
      <RoundButton
        label={$t`Close`}
        icon={CloseIcon}
        on:click={onClose}
        classes="small"
        />
    </hbox>
  </hbox>
{/if}

// #if [!WEBMAIL && !MOBILE]
<webview bind:this={webviewE} src={url} {title} {partition} />
// #elif [!WEBMAIL && MOBILE]
<webview bind:this={webviewE} />
// #else
<iframe bind:this={webviewE} src={url} {title} sandbox="allow-scripts allow-forms" />
// #endif

<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import RoundButton from './RoundButton.svelte';
  import Loader from './Loader.svelte';
  // #if [!WEBMAIL && MOBILE]
  import { InAppBrowser } from '@capgo/inappbrowser';
  // #endif
  import CloseIcon from "lucide-svelte/icons/x";
  import { getBaseDomainFromHost } from '../../logic/util/netUtil';
  import type { URLString } from '../../logic/util/util';
  import { t } from '../../l10n/l10n';
  const dispatch = createEventDispatcher();

  /**
   * Displays untrusted HTML in a sandboxed iframe which does not allow any JavaScript.
   */

  /** The start webpage to show. */
  export let url: URLString = "";
  /** Tooltip when hovering */
  export let title: string;
  /** The cookie storage. For `<webview partition="persist:...">` */
  export let sessionID: string;
  export let withURLbar = true;
  export let autofill: string;

  $: partition = sessionID ? "persist:" + sessionID : undefined;

  function getDomain(url: URLString) {
    if (!url) {
      return "";
    }
    return getBaseDomainFromHost(new URL(url).hostname);
  }

  let isLoading = true;
  let currentURL: URLString = url;

  let webviewE: HTMLIFrameElement = null;
  $: webviewE && haveWebView();
  // #if [!WEBMAIL && !MOBILE]
  function haveWebView () {
    webviewE.addEventListener("dom-ready", () => {
      currentURL = webviewE.src;
      dispatch("page-change", webviewE.src);
    });
    webviewE.addEventListener("did-start-loading", () => {
      isLoading = true;
    });
    webviewE.addEventListener("did-stop-loading", () => {
      isLoading = false;
      if (autofill) {
        webviewE.executeJavaScript(autofill);
      }
    });
  }
  // #else
  async function haveWebView () {
    await InAppBrowser.addListener("urlChangeEvent", () => {
      currentURL = webviewE.src;
      dispatch("page-change", webviewE.src);
    });
    await InAppBrowser.addListener("browserPageLoaded", async () => {
      isLoading = false;
      if (autofill) {
        await InAppBrowser.executeScript({ code: autofill });
      }
    });
    let x = webviewE.offsetLeft;
    let y = webviewE.offsetTop;
    let height = webviewE.height;
    let width = webviewE.width;
    await InAppBrowser.openWebView({
      url: url,
      headers: {
        "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36",
      },
      x: x,
      y: y,
      width: parseInt(width),
      height: parseInt(height),
    });
  };
  // #endif

  function onClose() {
    dispatch("close");
  }
</script>

<style>
  webview {
    flex: 1 0 0;
  }
  .toolbar {
    background-color: var(--leftbar-bg);
    color: var(--leftbar-fg);
    border-bottom: 1px solid var(--border);
    align-items: center;
    padding: 2px 12px;
  }
  .urlbar {
    justify-content: center;
    overflow: hidden;
    overflow-wrap: anywhere;
    text-overflow: ellipsis;
    height: 24px;
    padding: 2px 12px;
  }
  .buttons {
    align-items: center;
    justify-content: center;
    margin: 2px;
  }
  .buttons :global(> *) {
    margin-inline-start: 6px;
  }
  .loading {
    width: 24px;
  }
</style>
