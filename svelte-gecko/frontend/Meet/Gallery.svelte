<grid class="participants" style="grid-template-columns: {columns}">
  {#each $videos.each as video (video.id)}
    <ParticipatingVideo {video} {showSelf} />
  {/each}
</grid>

<script lang="ts">
  import type { VideoStream } from "../../logic/Meet/VideoStream";
  import type { Collection } from "svelte-collections";
  import ParticipatingVideo from "./Video/ParticipatingVideo.svelte";

  export let videos: Collection<VideoStream>;
  export let showSelf;

  $: columns = calculateColumns($videos.length);
  function calculateColumns(count: number) {
    if (count <= 1) {
      return "auto";
    }
    if (count <= 4) {
      return "auto auto";
    }
    if (count <= 9) {
      return "auto auto auto";
    }
    if (count <= 16) {
      return "auto auto auto auto";
    }
    return "auto auto auto auto auto";
  }
</script>

<style>
  .participants {
    display: grid;
    /* grid-template-columns/rows: see code */
  }
</style>
