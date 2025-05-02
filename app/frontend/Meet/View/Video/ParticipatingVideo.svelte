{#if video.isScreenShare}
  <VideoWithLabel {video}
    label={participant ? $t`Screen of ${$participant.name}` : $t`Screen`}
    classes="screen" />
{:else if video.isMe}
  {#if showSelf}
    <VideoWithLabel {video}
      label={$t`You`}
      classes="self" />
  {/if}
{:else if video.participant}
  <VideoWithLabel {video}
    label={$participant?.name}
    classes="participant" />
{/if}

<script lang="ts">
  import { VideoStream } from "../../../../logic/Meet/VideoStream";
  import VideoWithLabel from "./VideoWithLabel.svelte";
  import { t } from "../../../../l10n/l10n";

  export let video: VideoStream;
  export let showSelf: boolean;

  $: participant = video?.participant;
</script>
