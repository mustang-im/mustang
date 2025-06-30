// #if [!WEBMAIL]
<webview bind:this={webviewE} src={url ?? dataURL} {title} />
// #else
<!-- TODO Security: Test that this <webview> is untrusted and jailed -->
<iframe bind:this={webviewE} src={url ?? dataURL} {title} />
// #endif

<!--
{#if contextMenuItems && contextMenuItems.hasItems}
  <Menu opened={true} position="bottom" placement="end" on:close={() => contextMenuItems = null}>
    {#each contextMenuItems.each as menuItem}
      <Menu.Item
        on:click={() => catchErrors(() =>menuItem.action)}
        title={menuItem.label}
        icon={menuItem.icon}>
        {menuItem.label}
      </Menu.Item>
    {/each}
  </Menu>
{/if}
-->

<script lang="ts">
  // #if [!WEBMAIL]
  import { buildContextMenu, MenuItem, type ContextInfo } from "./ContextMenu";
  import { onKeyOnMessage } from "../Mail/Message/MessageKeyboard";
  import { appGlobal } from "../../logic/app";
  // import { Menu } from "@svelteuidev/core";
  // #endif
  import { stringToDataURL } from "../Util/util";
  import type { URLString } from "../../logic/util/util";
  import { backgroundError, catchErrors } from "../Util/error";
  import type { ArrayColl } from "svelte-collections";
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
  export let url: string | null = null;
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

  onMount(() =>{
    if (autoSize) {
      observeMaxWidth();
    }
  });

  let dataURL: URLString;
  $: html, setURL();
  async function setURL() {
    if (url) {
      return;
    }
    dataURL = "";
    const autoSizeCSS = `<style>
      body {
        min-height: 0px !important;
        min-width: 100px !important;
        height: fit-content !important;
        width: fit-content !important;
        over-flow: visible !important;
      }
    </style>`;
    let servers = allowServerCalls ? `* 'unsafe-inline'` : `'unsafe-inline'` ;
    const head = `<meta http-equiv="Content-Security-Policy" content="default-src 'none';
      style-src ${servers}; img-src data: ${servers}">\n\n` + headHTML + `\n\n`;
    let displayHTML = html ?? "";
    let headPos = displayHTML.indexOf("<head>");
    headPos = headPos < 0 ? 0 : headPos + 6;
    displayHTML =
      displayHTML.substring(0, headPos) +
      head +
      (autoSize ? autoSizeCSS: "") +
      displayHTML.substring(headPos);
    // console.log("html", displayHTML);
    dataURL = await stringToDataURL("text/html", displayHTML);
  }

  let webviewE: HTMLIFrameElement = null;
  $: webviewE && haveWebView();
  function haveWebView () {
    webviewE.addEventListener("dom-ready", async () => {
      try {
        dispatch("webview", webviewE);
        // #if [!WEBMAIL]
        if (autoSize) {
          webviewE.addEventListener("did-finish-load", onLoadResize);
        }
        await addInputListener();
        await addLinkListener();
        // #endif
      } catch (ex) {
        backgroundError(ex);
      }
    }, { once: true });

    // #if [!WEBMAIL]
    // <https://www.electronjs.org/docs/latest/api/webview-tag/#event-context-menu>
    webviewE.addEventListener("context-menu", event => catchErrors(() => {
      onContextMenu((event as any).params);
    }));
    // #endif
  }

  // #if [!WEBMAIL]
  async function addInputListener() {
    if (!webviewE) {
      return;
    }
    let id = (webviewE as any).getWebContentsId();
    await appGlobal.remoteApp.addEventListenerWebContents(id, "input-event", (event) => {
      if (event.type == "mouseDown") {
        webviewE.click();
      } else if (event.type == "rawKeyDown") {
        onKeyOnMessage(new KeyboardEvent("keydown", event));
      }
    });
  }

  async function addLinkListener() {
    if (!webviewE) {
      return;
    }
    let id = (webviewE as any).getWebContentsId();
    let url: string;
    await appGlobal.remoteApp.addEventListenerWebContents(id, "update-target-url", (eventURL) => {
      url = eventURL; // Can also reset `eventURL` to null
    });
    await appGlobal.remoteApp.addEventListenerWebContents(id, "input-event", async (event) => {
      if (!url) {
        return;
      }
      let modifiers = event.modifiers.map(m => m.toLowerCase());
      let isLeft = ["left", "leftbuttondown"].some(left => modifiers.some(mod => mod == left));
      if (isLeft && event.type == "mouseDown") {
        await appGlobal.remoteApp.openExternalURL(url);
      }
    });
  }

  let contextMenuItems: ArrayColl<MenuItem>;
  async function onContextMenu(contextInfo: ContextInfo) {
    contextMenuItems = await buildContextMenu(contextInfo, webviewE);
    console.log("Context menu items:", contextMenuItems.contents.map(i => i.id).join(", "), contextMenuItems.contents);
    let menuItems = contextMenuItems.contents.map(item => ({
      id: item.id,
      label: item.label,
      icon: item.icon,
      click: () => catchErrors(item.action),
    }));
    if (!menuItems.length) {
      return;
    }
    await appGlobal.remoteApp.openMenu(menuItems);
  }

  let size: { width: number; height: number };
  async function getContentSize() {
    try {
      size = await webviewE.executeJavaScript(`
        try {
          const body = document.body;
          const styles = window.getComputedStyle(body);
          const width = parseFloat(styles.width);
          const height = Math.max( body.scrollHeight, body.offsetHeight, parseFloat(styles.height) );
          new Promise((resolve) => {
            resolve({
              width: width,
              height: height,
            });
          });
        } catch (ex) {
          new Promise((_, reject) => {
            reject(JSON.stringify(ex));
          });
        }
      `);
    } catch (ex) {
      console.error(ex);
    }
  }

  async function onLoadResize() {
    await getContentSize();
    resizeWebview();
  }
  // #endif

  const heightBuffer = 10;
  let maxWidth: number;
  $: autoSize && size && maxWidth && resizeWebview();
  function resizeWebview() {
    if ((webviewE.parentElement && size.width > webviewE.parentElement.clientWidth) &&
    (!maxWidth || maxWidth && size.width < maxWidth)) {
      webviewE.style.width = size.width + "px";
    }
    if (maxWidth && maxWidth < size.width) {
      webviewE.style.width = maxWidth + "px";
    }
    if (webviewE.parentElement && size.width < webviewE.parentElement.clientWidth) {
      webviewE.style.width = "100%";
    }
    webviewE.style.height = (size.height + heightBuffer) + "px";
  };

  function observeMaxWidth() {
    const parent = parentWithMaxWidth(webviewE);
    const maxWidthVal = getComputedStyle(parent).maxWidth;
    const observer = new ResizeObserver((entries) => {
      const el = entries[0];
      if (maxWidthVal.endsWith("%")) {
        maxWidth = el.contentRect.width * (parseInt(maxWidthVal)/100);
      } else {
        maxWidth = parseInt(maxWidthVal);
      }
    });
    observer.observe(parent.parentElement);
  }

  function parentWithMaxWidth(el: HTMLElement) {
    while (el.parentElement &&
      getComputedStyle(el).maxWidth == "none") {
      el = el.parentElement;
    }
    return el;
  }
</script>

<style>
  webview, iframe {
    flex: 1 0 0;
    width: 100%;
    height: auto;
  }
  iframe {
    border: none;
  }
</style>
