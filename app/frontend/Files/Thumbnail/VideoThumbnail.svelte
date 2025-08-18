<!-- svelte-ignore a11y-media-has-caption -->
<video
  src={file.url}
  preload="meta"
  bind:this={videoE}
  muted
  width={size} height={size}
  title={file.name}
  on:mouseenter={() => catchErrors(startPlaying)}
  on:mouseleave={() => catchErrors(stopPlaying)}
  />

<script lang="ts">
  import { File } from "../../../logic/Files/File";
  import { sleep } from "../../../logic/util/util";
  import { catchErrors } from "../../Util/error";

  export let file: File;
  export let size = 16;

  let videoE: HTMLVideoElement;
  async function startPlaying() {
    await sleep(1);
    await videoE.play();
  }
  function stopPlaying() {
    videoE.pause();
  }
</script>
