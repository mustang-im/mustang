{#if audioOnly.stream}
  <audio bind:this={audioEl} />
{/if}

<script lang="ts">
  import { VideoStream } from "../../../../logic/Meet/VideoStream";
  import { onDestroy } from "svelte";

  export let audioOnly: VideoStream;

  let audioEl: HTMLAudioElement;
  $: audioEl && audioOnly.stream ? startAudio() : stopAudio();
  function startAudio() {
    audioEl.srcObject = audioOnly.stream;
    audioEl.play();
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
