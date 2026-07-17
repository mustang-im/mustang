{#if audioOnly.stream}
  <audio bind:this={audioEl} />
{/if}

<script lang="ts">
  import { VideoStream } from "../../../../logic/Meet/VideoStream";
  import { catchErrors } from "../../../Util/error";
  import { onDestroy } from "svelte";

  export let audioOnly: VideoStream;

  let audioEl: HTMLAudioElement;
  $: audioEl && catchErrors(audioOnly.stream ? startAudio : stopAudio);
  async function startAudio() {
    audioEl.srcObject = audioOnly.stream;
    try {
      await audioEl.play();
    } catch (ex) {
      if (ex?.name == "AbortError" || ex?.message?.includes("https://goo.gl/LdLk22")) {
        // Element was torn down (e.g. stream moved to the video list) before play() resolved
      } else {
        throw ex;
      }
    }
  }
  function stopAudio() {
    if (!audioEl) {
      return;
    }
    audioEl.pause();
    audioEl.srcObject = null;
  }

  onDestroy(stopAudio);
</script>
