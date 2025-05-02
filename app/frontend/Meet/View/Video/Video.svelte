<!-- svelte-ignore a11y-media-has-caption -->
{#if video.stream && width && height}
  <video bind:this={videoEl}
    muted={video.isMe}
    {width} {height}
    class={videoStreamClassName(video)} />
{:else if video.isMe}
  <img src={appGlobal.me.picture} alt={$t`me`} />
{:else if video.participant}
  <img src={video.participant.picture} alt={video.participant.name} />
{/if}

<script lang="ts">
  import { VideoStream, videoStreamClassName } from "../../../../logic/Meet/VideoStream";
  import { appGlobal } from "../../../../logic/app";
  import { onDestroy } from "svelte";
  import { t } from "../../../../l10n/l10n";

  export let video: VideoStream;
  export let width: number;
  export let height: number;

  let videoEl: HTMLVideoElement;
  $: videoEl && video.stream ? startVideo() : stopVideo();
  function startVideo() {
    videoEl.srcObject = video.stream;
    videoEl.play();
  }
  function stopVideo() {
    if (!videoEl) {
      return;
    }
    videoEl.pause();
    videoEl.srcObject = null;
  }

  onDestroy(stopVideo);
</script>

<style>
  img,
  video {
    object-fit: cover;
  }
  video.screen {
    object-fit: contain;
  }
</style>
