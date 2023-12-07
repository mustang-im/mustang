<!-- svelte-ignore a11y-media-has-caption -->
<video bind:this={videoEl} />

<script lang="ts">
  import { onDestroy } from "svelte";
  import { VideoStream, SelfVideo } from "../../logic/Meet/VideoStream";

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
