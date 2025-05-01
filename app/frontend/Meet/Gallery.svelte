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
  import { SelfVideo, type VideoStream } from "../../logic/Meet/VideoStream";
  import type { Collection } from "svelte-collections";
  import ParticipatingVideo from "./Video/ParticipatingVideo.svelte";
  import Scroll from "../Shared/Scroll.svelte";

  export let videos: Collection<VideoStream>;
  export let showSelf: boolean;

  let width: number;

  $: columns = calculateColumns($videos.length, width);
  function calculateColumns(count: number, width: number) {
    if (!width) {
      return "";
    }
    const min = 256; /** minimum width per video */
    let columnCount = 1;
    if (count < 2 && showSelf || width < min * 2) {
      columnCount = 1;
    } else if (count <= 4 || width < min * 3) {
      columnCount = 2;
    } else if (count <= 9 || width < min * 4) {
      columnCount = 3;
    } else if (count <= 16 || width < min * 5) {
      columnCount = 4;
    } else {
      columnCount = 5;
    }
    return `repeat(${columnCount}, 1fr)`;
    //return `repeat(${columnCount}, ${Math.floor(100/columnCount)}%)`;
  }
</script>

<style>
  .participants {
    display: grid;
    /* grid-template-columns/rows: see code above */
  }
  /*
  .one-to-one :global(.participant-box.self),
  .one-to-one :global(.participant.self) {
    justify-self: end;
  }
  .one-to-one :global(.participant.self) {
    width: 256px;
  }
  */
</style>
