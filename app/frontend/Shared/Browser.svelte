<hbox class="toolbar">
  <hbox class="urlbar" flex>
    {getDomain(webviewE?.src ?? " original" + url)}
  </hbox>
  <hbox class="buttons right">
    <RoundButton
      label="Close"
      icon={CloseIcon}
      on:click={onClose}
      classes="small"
      />
  </hbox>
</hbox>

<webview bind:this={webviewE} src={url} {title} {partition} />

<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import RoundButton from './RoundButton.svelte';
  import CloseIcon from "lucide-svelte/icons/x";
  import { getBaseDomainFromHost } from '../../logic/util/netUtil';
  import type { URLString } from '../../logic/util/util';
  const dispatch = createEventDispatcher();

  /**
   * Displays untrusted HTML in a sandboxed iframe which does not allow any JavaScript.
   */

  /** The start webpage to show. */
  export let url = "";
  /** Tooltip when hovering */
  export let title: string;
  export let sessionSaveID: string;

  $: partition = sessionSaveID ? "persist:" + sessionSaveID : undefined;

  function getDomain(url: URLString) {
    if (!url) {
      return "";
    }
    return getBaseDomainFromHost(new URL(url).hostname);
  }

  let webviewE: HTMLIFrameElement = null;
  $: webviewE && haveWebView();
  function haveWebView () {
    webviewE.addEventListener("dom-ready", () => {
      dispatch("page-change", webviewE.src);
    });
  }

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
  }
  .urlbar {
    align-items: start;
    justify-content: center;
    overflow: hidden;
    overflow-wrap: anywhere;
    text-overflow: ellipsis;
    height: 24px;
    padding: 2px 12px;
  }
  .buttons {
    align-items: start;
    justify-content: end;
    margin: 2px;
  }
</style>
