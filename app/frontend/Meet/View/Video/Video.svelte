<!-- svelte-ignore a11y-media-has-caption -->
<video bind:this={videoEl}
  {muted}
  playsinline
  {width} {height}
  class={classes} />

<script lang="ts">
  import { sleep } from "../../../../logic/util/util";
  import { catchErrors } from "../../../Util/error";
  import { onDestroy } from "svelte";

  export let stream: MediaStream;
  export let muted: boolean;
  export let width: number = undefined;
  export let height: number = undefined;
  export let classes: string | undefined = undefined;

  let isFirefox = /firefox/i.test(navigator.userAgent);
  let isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

  let videoEl: HTMLVideoElement;
  $: videoEl && stream ? catchErrors(startVideo) : catchErrors(stopVideo);
  async function startVideo() {
    videoEl.srcObject = stream;
    if (isFirefox || isSafari) {
      /* Firefox has a timing issue and doesn't actually attach the video
       * unless `srcObject` is assigned out-of-band, otherwise it shows only a
       * frozen first frame.
       * Safari 15 sometimes renders black until the src is reset. */
      await sleep(0);
      if (!videoEl || videoEl.srcObject != stream) {
        return; // torn down or replaced while we waited
      }
      videoEl.srcObject = stream;
    }
    try {
      await videoEl.play();
    } catch (ex) {
      if (ex?.name == "AbortError" || ex?.message?.includes("https://goo.gl/LdLk22")) {
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
