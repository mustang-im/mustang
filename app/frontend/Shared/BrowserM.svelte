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

<webview bind:this={webviewE} />

<script lang="ts">
  import { createEventDispatcher, onDestroy } from 'svelte';
  import RoundButton from './RoundButton.svelte';
  import Loader from './Loader.svelte';
  import { InAppBrowser, ToolBarType } from '@capgo/inappbrowser';
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
  async function haveWebView() {
    await InAppBrowser.addListener("urlChangeEvent", (event) => {
      currentURL = event.url;
      dispatch("page-change", event.url);
    });

    await InAppBrowser.addListener("browserPageLoaded", async () => {
      isLoading = false;
      if (autofill) {
          await InAppBrowser.executeScript({ code: autofill });
      }
    });

    await InAppBrowser.addListener("closeEvent", async () => {
      await InAppBrowser.removeAllListeners();
    });

    let height = webviewE.clientHeight;
    let width = webviewE.clientWidth;
    await InAppBrowser.openWebView({
      url: url,
      preventDeeplink: true,
      headers: {
        // Set User-Agent Header to the same as a normal Android Chrome Browser
        // because embedded user agents are not allowed for OAuth2
        "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36",
      },
      toolbarType: ToolBarType.BLANK,
      title: title,
      visibleTitle: false,
      // Set the width and height to the same as the placeholder <webview> element
      width: width,
      height: height,
    });
  };

  onDestroy(destroyWebView);
  async function destroyWebView() {
    await InAppBrowser.close();
    await InAppBrowser.removeAllListeners();
  }

  async function onClose() {
    dispatch("close");
    await InAppBrowser.close();
    await InAppBrowser.removeAllListeners();
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
