<vbox class="participant video {classes}" title={label}>
  <Video {video} />
  {#if video.participant}
    <hbox class="participant-name">
      <ParticipantItem participant={video.participant} style="video" />
    </hbox>
  {/if}
</vbox>

<script lang="ts">
  import { VideoStream } from "../../../../logic/Meet/VideoStream";
  import ParticipantItem from "../../ParticipantsList/ParticipantItem.svelte";
  import Video from "./Video.svelte";

  export let video: VideoStream;
  export let label: string;
  export let classes = "";
</script>

<style>
  .participant {
    position: relative;
  }
  .participant-name {
    position: absolute;
    bottom: 0;
    left: 0;
  }
</style>
