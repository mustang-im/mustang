{#if video instanceof ParticipantVideo}
  <VideoWithLabel {video}
    label={video.participant?.name}
    classes="participant" />
{:else if video instanceof SelfVideo && showSelf}
  <VideoWithLabel {video}
    label="You"
    classes="self" />
{:else if video instanceof ScreenShare}
  <VideoWithLabel {video}
    label={video.participant ? `Screen of ${video.participant.name}` : "Screen"}
    classes="screen" />
{/if}

<script lang="ts">
  import { VideoStream, ParticipantVideo, ScreenShare, SelfVideo } from "../../../logic/Meet/VideoStream";
  import VideoWithLabel from "./VideoWithLabel.svelte";

  export let video: VideoStream;
  export let showSelf: boolean;
</script>
