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
  import type { VideoStream } from "../../../logic/Meet/VideoStream";
  import { MeetVideoView } from "./ViewSelectorPopup.svelte";
  import ParticipatingVideo from "./Video/ParticipatingVideo.svelte";
  import Scroll from "../../Shared/Scroll.svelte";
  import type { Collection } from "svelte-collections";

  export let videos: Collection<VideoStream>;
  export let view: MeetVideoView;
  export let showSelf: boolean;

  let width: number;

  $: columns = calculateColumns($videos.length, width, view);
  function calculateColumns(count: number, width: number, view: MeetVideoView) {
    if (!width) {
      return "";
    }
    const min = 100; /** minimum width per video, for manual view */
    const autoMin = 256; /** minimum width per video, for auto view */
    let columnCount = 1;
    if (count < 2 && showSelf || width < min * 2 ||
      width < autoMin * 2 && view == MeetVideoView.GalleryAutoView) {
      columnCount = 1;
    } else if (count <= 4 || width < min * 3 || view == MeetVideoView.Gallery2x2View ||
      width < autoMin * 3 && view == MeetVideoView.GalleryAutoView) {
      columnCount = 2;
    } else if (count <= 9 || width < min * 4 || view == MeetVideoView.Gallery3x3View ||
      width < autoMin * 4 && view == MeetVideoView.GalleryAutoView) {
      columnCount = 3;
    } else if (count <= 16 || width < min * 5 || view == MeetVideoView.Gallery4x4View ||
      width < autoMin * 5 && view == MeetVideoView.GalleryAutoView) {
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
</style>
