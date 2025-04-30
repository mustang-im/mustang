<!-- svelte-ignore a11y-media-has-caption -->
{#if video.stream}
  <video bind:this={videoEl} muted={video instanceof SelfVideo}
    class={videoStreamClassName(video)} />
{:else if video instanceof ParticipantVideo}
  <img src={video.participant.picture} alt={video.participant.name} />
{:else if video instanceof SelfVideo}
  <img src={appGlobal.me.picture} alt={$t`me`} />
{/if}

<script lang="ts">
  import { VideoStream, SelfVideo, ParticipantVideo, videoStreamClassName } from "../../../logic/Meet/VideoStream";
  import { appGlobal } from "../../../logic/app";
  import { onDestroy } from "svelte";
  import { t } from "../../../l10n/l10n";

  export let video: VideoStream;

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
    max-width: 100%;
    max-height: 100%;
    width: 100%;
    height: 100%;
  }
  video.screen {
    object-fit: contain;
  }
</style>
