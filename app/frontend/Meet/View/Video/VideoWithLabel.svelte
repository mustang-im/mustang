<vbox class="participant video {classes}" title={label}>
  {#if video.stream && width && height}
    <Video
      stream={video.stream}
      muted={video.isMe}
      {width} {height}
      classes={videoStreamClassName(video)} />
  {:else if video.isMe}
    <img src={appGlobal.me.picture} alt={$t`me`} />
  {:else if video.participant}
    <img src={video.participant.picture} alt={video.participant.name} />
  {/if}

  {#if video.participant}
    <hbox class="participant-name">
      <ParticipantItem participant={video.participant} style="video" />
    </hbox>
  {/if}
</vbox>

<script lang="ts">
  import { appGlobal } from "../../../../logic/app";
  import { VideoStream, videoStreamClassName } from "../../../../logic/Meet/VideoStream";
  import Video from "./Video.svelte";
  import ParticipantItem from "../../ParticipantsList/ParticipantItem.svelte";
  import { t } from "../../../../l10n/l10n";

  export let video: VideoStream;
  export let label: string;
  export let classes = "";
  export let width: number;
  export let height: number;
</script>

<style>
  .participant {
    position: relative;
  }
  img {
    object-fit: cover;
  }
  .participant-name {
    position: absolute;
    bottom: 0;
    left: 0;
  }
</style>
