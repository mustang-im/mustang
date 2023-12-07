{#if video instanceof ParticipantVideo}
  <VideoWithLabel label={video.participant?.name} {video} />
{:else if video instanceof SelfVideo && showSelf}
  <VideoWithLabel label="You" {video} />
{:else if video instanceof ScreenShare}
  <VideoWithLabel label={video.participant ? `Screen of ${video.participant.name}` : "Screen"} {video} />
{/if}

<script lang="ts">
  import { VideoStream, ParticipantVideo, ScreenShare, SelfVideo } from "../../logic/Meet/VideoStream";
  import VideoWithLabel from "./VideoWithLabel.svelte";

  export let video: VideoStream;
  export let showSelf: boolean;
</script>
