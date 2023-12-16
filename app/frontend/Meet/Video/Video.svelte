<!-- svelte-ignore a11y-media-has-caption -->
{#if video.stream}
  <video bind:this={videoEl} muted={video instanceof SelfVideo} />
{:else if video instanceof ParticipantVideo}
  <img src={video.participant.picture} alt={video.participant.name} />
{:else if video instanceof SelfVideo}
  <img src={appGlobal.me.picture} alt="me" />
{/if}

<script lang="ts">
  import { VideoStream, SelfVideo, ParticipantVideo } from "../../../logic/Meet/VideoStream";
  import { appGlobal } from "../../../logic/app";
  import { onDestroy } from "svelte";

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
    aspect-ratio: 16/9;
    object-fit: cover;
  }
</style>
