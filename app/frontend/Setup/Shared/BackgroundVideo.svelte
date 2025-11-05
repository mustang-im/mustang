<video class="background-video" autoplay loop muted playsinline poster={fallbackPicURL} bind:this={videoEl}>
  <source src={videoURL} type="video/mp4">
</video>
<vbox class="button">
  <Button classes="pause" label={paused ? $t`Play` : $t`Pause`} icon={paused ? PlayIcon : PauseIcon} on:click={pause} iconSize="16px" plain iconOnly />
</vbox>

<script lang="ts">
  import Button from "../../Shared/Button.svelte";
  import PauseIcon from "lucide-svelte/icons/pause";
  import PlayIcon from "lucide-svelte/icons/play";
  import { onMount } from "svelte";
  import { t } from "../../../l10n/l10n";

  let videoURL: string = "https://www.mustang.im/videos/ocean-birds.mp4";
  let fallbackPicURL: string = ""; // "https://www.mustang.im/videos/ocean-birds.jpg";

  let paused = false;
  let videoEl: HTMLVideoElement;
  function pause() {
    paused = !paused;
    // bind:paused only works the second time
    if (paused) {
      videoEl.pause();
    } else {
      videoEl.play();
    }
  }

  // Stop on inactivity, to avoid using CPU resources in background
  onMount(() => setTimeout(() => {
    videoEl?.pause();
  }, 10 * 60 * 1000)); // 10 minutes
</script>

<style>
  .background-video {
    width: 100vw;
    height: 100vh;
    object-fit: cover;
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    z-index: -1;
  }
  .button {
    position: fixed;
    right: 10px;
    bottom: 10px;
    z-index: 1;
  }
</style>
