<Popup bind:popupOpen={showSelector} {popupAnchor} autoClose={false}
  placement="top-start" boundaryElSel=".main">
  <vbox class="dialog">
    {#if errorMessage}
      <hbox class="error">
        {errorMessage}
      </hbox>
    {:else if $screens.hasItems}

      <hbox class="screens">
        {#each $screens.each as screen}
          <vbox class="screen" on:click={() => onSelect(screen)}>
            <img src={screen.thumbnailURL}
              width={kThumbnailWidth} height={kThumbnailHeight}
              alt="" />
            <hbox class="name" style="--thumbnail-width: {kThumbnailWidth}px">
              {screen.name}
            </hbox>
          </vbox>
        {/each}
      </hbox>

    {:else}
      {$t`Looking for your screens and windows…`}
    {/if}

    <!-- TODO How to properly report abort or errors to caller?
      https://github.com/electron/electron/issues/45517#issuecomment-2965188048
    <hbox flex />
    <hbox class="buttons">
      <Button
        label={$t`Cancel`}
        onClick={() => onError(new UserError($t`User aborted screen share selection`))}
        />
    </hbox>
    -->
  </vbox>
</Popup>
<hbox bind:this={popupAnchor} />

<script lang="ts">
  import { appGlobal } from "../../logic/app";
  import Popup from "../Shared/Popup.svelte";
  import Button from "../Shared/Button.svelte";
  import { UserError } from "../../logic/util/util";
  import { t } from "../../l10n/l10n";
  import { onDestroy } from "svelte";
  import { ArrayColl } from "svelte-collections";
  type DesktopCapturerSource = any; // import type { DesktopCapturerSource } from "electron";

  let showSelector: boolean = false;
  let isListening = false;
  let popupAnchor: HTMLElement;
  let errorMessage: string | null = null;

  const kThumbnailHeight = 150; // desktopCapturer.getSources() default
  const kThumbnailWidth = 150;

  type Screen = {
    name: string;
    thumbnailURL: string;
    electronScreen: DesktopCapturerSource;
  }
  let screens = new ArrayColl<Screen>();
  let onDone: (screen: DesktopCapturerSource) => void;
  let onReject: (ex: Error) => void;
  let onErrorCallback: (ex: Error) => void;

  async function onScreensRequested(aScreens: any[]) {
    screens.clear();
    for (let aScreen of aScreens) {
      screens.add({
        electronScreen: aScreen,
        name: aScreen.name?.substring(0, 80) ?? `?`,
        thumbnailURL: await aScreen.thumbnail.toDataURL(),
      });
    }
    return new Promise((resolve, reject) => {
      onDone = resolve;
      onReject = reject;
    });
  }

  async function onSelect(screen: Screen) {
    onDone(screen.electronScreen);
    await onClose();
  }

  async function onError(ex: Error) {
    if (onErrorCallback) {
      onErrorCallback(ex);
    }
    if (onReject) {
      //onReject(ex);
    }
    await onClose();
  }

  export async function openSelector(onError: (ex: Error) => void) {
    onErrorCallback = onError;
    showSelector = true;
    await onOpen();
  }
  export async function closeSelector() {
    await onClose();
  }

  export async function onOpen() {
    isListening = true;
    await appGlobal.remoteApp.onScreenSharingSelect(onScreensRequested);
  }

  async function onClose() {
    screens.clear();
    if (showSelector) {
      showSelector = false;
    }
    if (isListening) {
      await appGlobal.remoteApp.onScreenSharingSelect(null);
      isListening = false;
    }
  }
  onDestroy(onClose);
</script>

<style>
  .dialog {
    width: 60vw;
    height: 60vh;
    background-color: var(--leftbar-bg);
    color: var(--leftbar-fg);
    padding: 32px;
    border-radius: 5px;
    box-shadow: 2.281px 1.14px 9.123px 0px rgba(var(--shadow-color), 20%);
  }
  .screens {
    flex-wrap: wrap;
  }
  .screen {
    margin: 12px;
    padding: 12px;
  }
  .screen:hover {
    background-color: var(--hover-bg);
    color: var(--hover-fg);
  }
  .screen .name {
    max-width: var(--thumbnail-width);
    max-height: 50px;
    overflow: hidden;
    margin-block-start: 8px;
  }
  .buttons {
    align-items: center;
    justify-content: end;
  }
</style>
