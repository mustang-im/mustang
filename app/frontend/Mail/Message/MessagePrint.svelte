{#if on}
  <hbox>
    <HTMLDisplay html={message.html} {webviewE} on:webview={onWebView} />
  </hbox>
{/if}

<script lang="ts">
  import type { EMail } from "../../../logic/Mail/EMail";
  import { openExternalURL } from "../../../logic/util/os-integration";
  import HTMLDisplay from "./HTMLDisplay.svelte";
  import { sleep, NotImplemented } from "../../../logic/util/util";
  import { tick } from "svelte";
  import { t } from "../../../l10n/l10n";

  export let message: EMail;

  let webviewE: HTMLIFrameElement;
  let on = false;

  export async function print() {
    await showWarning();
    let webview = await loadWebView();
    await webview.print(options());
    await sleep(200); // If we close the webview, the Print dialog stays open, but then doesn't actually print
    on = false;
  }

  export async function pdf() {
    throw new NotImplemented();
    let webview = await loadWebView();
    await webview.printToPDF(options()); // TODO doesn't open the dialog, at least on Linux
    await sleep(200);
    on = false;
  }

  function options() {
    return {
      header: message.subject,
    };
  }

  async function showWarning() {
    if (Math.random() > 0.02) {
      return;
    }
    alert($t`Save the trees!`);
    const kVideoURL = "https://youtube.com/embed/jEI-0PjE3-g?start=22";
    await openExternalURL(kVideoURL);
  }

  let gotWebView: (webview: any) => void;
  async function loadWebView(): Promise<any> {
    if (on) {
      on = false;
      await tick();
    }
    on = true;
    return new Promise((resolve, reject) => {
      gotWebView = resolve;
    });
  }

  function onWebView(event: CustomEvent) {
    let webviewE = event.detail;
    gotWebView(webviewE);
  }
</script>

<style>
  hbox {
    height: 1px;
    width: 1px;
  }
</style>
