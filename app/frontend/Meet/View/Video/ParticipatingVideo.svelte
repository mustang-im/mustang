{#if video instanceof ParticipantVideo}
  <VideoWithLabel {video}
    label={$participant?.name}
    classes="participant" />
{:else if video instanceof SelfVideo && showSelf}
  <VideoWithLabel {video}
    label={$t`You`}
    classes="self" />
{:else if video instanceof ScreenShare}
  <VideoWithLabel {video}
    label={participant ? $t`Screen of ${$participant.name}` : $t`Screen`}
    classes="screen" />
{/if}

<script lang="ts">
  import { VideoStream, ParticipantVideo, ScreenShare, SelfVideo } from "../../../../logic/Meet/VideoStream";
  import VideoWithLabel from "./VideoWithLabel.svelte";
  import { t } from "../../../../l10n/l10n";

  export let video: VideoStream;
  export let showSelf: boolean;

  $: participant = (video as ParticipantVideo | ScreenShare)?.participant;
</script>
