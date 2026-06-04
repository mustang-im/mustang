<!-- svelte-ignore a11y-media-has-caption -->
<video
  src={$file.url}
  preload="meta"
  bind:this={videoE}
  muted
  title={$file.name}
  class:preview
  on:mouseenter={() => catchErrors(startPlaying)}
  on:mouseleave={() => catchErrors(stopPlaying)}
  />

<script lang="ts">
  import { File } from "../../../logic/Files/File";
  import { sleep } from "../../../logic/util/util";
  import { catchErrors } from "../../Util/error";

  export let file: File;
  export let preview: boolean;

  let videoE: HTMLVideoElement;
  async function startPlaying() {
    await sleep(1);
    await videoE.play();
  }
  function stopPlaying() {
    videoE.pause();
  }
</script>

<script lang="ts" context="module">
  export const kSupportedExt = ["mpg", "mpeg", "mp4v", "mp4", "mp2", "m2v", "mpg4", "m1v", "mpe"];
</script>

<style>
  video {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  video.preview {
    object-fit: cover;
  }
</style>
