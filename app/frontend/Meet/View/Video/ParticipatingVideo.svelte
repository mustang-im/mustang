{#if video.isScreenShare}
  <VideoWithLabel {video}
    {width} {height}
    label={participant ? $t`Screen of ${$participant.name}` : $t`Screen`}
    classes="screen" />
{:else if video.isMe}
  {#if showSelf}
    <VideoWithLabel {video}
      {width} {height}
      label={$t`You`}
      classes="self" />
  {/if}
{:else if video.participant}
  <VideoWithLabel {video}
    {width} {height}
    label={$participant?.name}
    classes="participant" />
{/if}

<script lang="ts">
  import { VideoStream } from "../../../../logic/Meet/VideoStream";
  import VideoWithLabel from "./VideoWithLabel.svelte";
  import { t } from "../../../../l10n/l10n";

  export let video: VideoStream;
  export let showSelf: boolean;
  export let width: number;
  export let height: number;

  $: participant = video?.participant;
</script>
