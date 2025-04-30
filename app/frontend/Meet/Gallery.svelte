<Scroll>
  <grid class="participants"
    style="grid-template-columns: {columns}"
    bind:clientWidth={width}
    class:one-to-one={$videos.length <= 2}
    >
    {#each $videos.each as video (video.id)}
      <ParticipatingVideo {video} {showSelf} />
    {/each}
  </grid>
</Scroll>

<script lang="ts">
  import { SelfVideo, videoStreamClassName, type VideoStream } from "../../logic/Meet/VideoStream";
  import type { Collection } from "svelte-collections";
  import ParticipatingVideo from "./Video/ParticipatingVideo.svelte";
  import Scroll from "../Shared/Scroll.svelte";

  export let videos: Collection<VideoStream>;
  export let showSelf;

  let width: number;

  $: columns = calculateColumns($videos.length, width);
  function calculateColumns(count: number, width: number) {
    if (!width) {
      return "";
    }
    const min = 256; /** minimum width per video */
    if (count <= 2 && $videos.find(video => video instanceof SelfVideo) ||
        width < min * 2) {
      return "auto";
    }
    if (count <= 4 || width < min * 3) {
      return "auto auto";
    }
    if (count <= 9 || width < min * 4) {
      return "auto auto auto";
    }
    if (count <= 16 || width < min * 5) {
      return "auto auto auto auto";
    }
    return "auto auto auto auto auto";
  }
</script>

<style>
  .participants {
    display: grid;
    /* grid-template-columns/rows: see code above */
  }
  .one-to-one :global(.participant-box.self),
  .one-to-one :global(.participant.self) {
    justify-self: end;
  }
  .one-to-one :global(.participant.self) {
    width: 256px;
  }
</style>
