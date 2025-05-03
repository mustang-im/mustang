<!-- svelte-ignore a11y-media-has-caption -->
<video bind:this={videoEl}
  {muted}
  {width} {height}
  class={classes} />

<script lang="ts">
  import { catchErrors } from "../../../Util/error";
  import { onDestroy } from "svelte";

  export let stream: MediaStream;
  export let width: number;
  export let height: number;
  export let muted: boolean;
  export let classes: string | undefined = undefined;

  let videoEl: HTMLVideoElement;
  $: videoEl && stream ? catchErrors(startVideo) : catchErrors(stopVideo);
  async function startVideo() {
    videoEl.srcObject = stream;
    try {
      await videoEl.play();
    } catch (ex) {
      if (ex?.message?.includes("https://goo.gl/LdLk22")) {
        console.error(ex);
        // ignore
      } else {
        throw ex;
      }
    }
  }
  async function stopVideo() {
    if (!videoEl) {
      return;
    }
    videoEl.pause();
    videoEl.srcObject = null;
  }

  onDestroy(stopVideo);
</script>

<style>
  video {
    object-fit: cover;
    transition: width 200ms ease, height 200ms ease;
  }
  video.screen {
    object-fit: contain;
  }
</style>
