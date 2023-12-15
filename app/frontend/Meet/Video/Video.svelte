<!-- svelte-ignore a11y-media-has-caption -->
<video bind:this={videoEl} />

<script lang="ts">
  import { VideoStream, SelfVideo } from "../../../logic/Meet/VideoStream";
  import { onDestroy } from "svelte";

  export let video: VideoStream;

  $: video && video.stream && videoEl && connectStream();
  function connectStream() {
    videoEl.srcObject = video.stream;
    videoEl.play();
    if (video instanceof SelfVideo) {
      videoEl.muted = true;
    }
  }

  onDestroy(() => {
    videoEl.pause();
    videoEl.srcObject = null;
  });

  let videoEl: HTMLVideoElement;
</script>

<style>
  video {
    width: 100%;
    height: 100%;
  }
</style>
