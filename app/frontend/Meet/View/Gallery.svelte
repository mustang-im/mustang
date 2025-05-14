<vbox class="gallery" bind:clientWidth={gridWidth} bind:clientHeight={gridHeight} flex>
  <Scroll>
    <grid class="participants"
      style="grid-template-columns: {gridColumns}"
      class:one-to-one={$videos.length <= 1 || showSelf && $videos.length <= 2}
      >
      {#each $videos.each as video (video.id)}
        <ParticipatingVideo {video} {showSelf} width={videoWidth} height={videoHeight} />
      {/each}
    </grid>
  </Scroll>
</vbox>

<script lang="ts">
  import type { VideoStream } from "../../../logic/Meet/VideoStream";
  import { MeetVideoView } from "./ViewSelectorPopup.svelte";
  import ParticipatingVideo from "./Video/ParticipatingVideo.svelte";
  import Scroll from "../../Shared/Scroll.svelte";
  import type { Collection } from "svelte-collections";
  import { useDebounce } from "@svelteuidev/composables";

  export let videos: Collection<VideoStream>;
  export let view: MeetVideoView;
  export let showSelf: boolean;

  let gridWidth: number;
  let gridHeight: number;
  let videoWidth: number;
  let videoHeight: number;

  let gridColumns: string;
  const calculateColumnsDebounced = useDebounce(() => calculateColumns($videos.length, gridWidth, gridHeight, view), 20);
  $: $videos, showSelf, gridWidth, gridHeight, view, calculateColumnsDebounced();
  function calculateColumns(count: number, width: number, height: number, view: MeetVideoView) {
    if (!width) {
      return "";
    }
    if (!showSelf && videos.find(v => v.isMe)) {
      count--;
    }
    const min = 100; /** minimum width per video, for manual view */
    const autoMin = 256; /** minimum width per video, for auto view */
    let columnCount = 1;
    if (count < 2 || width < min * 2 ||
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

    videoWidth = Math.floor(width / columnCount);
    let idealVideoHeight = videoWidth / 16 * 9;
    let rows = Math.round(height / idealVideoHeight);
    if (count <= 2 && columnCount <= 2) {
      rows = 1;
    }
    videoHeight = Math.floor(height / rows);
    // console.log("gallery", "columns", columnCount, "rows", rows, "grid", width, "x", height, "video", videoWidth, "x", videoHeight, "ideal height", idealVideoHeight);

    gridColumns = `repeat(${columnCount}, 1fr)`;
  }
</script>

<style>
  .gallery :global(.scroll) {
    overflow-x: hidden;
  }
  .participants {
    display: grid;
    /* grid-template-columns/rows: see code above */
  }
  .gallery :global(.scroll) {
    scroll-snap-type: y mandatory;
  }
  .participants > :global(.participant) {
    scroll-snap-align: start;
  }
</style>
