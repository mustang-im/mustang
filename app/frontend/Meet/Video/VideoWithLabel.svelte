<vbox flex class="participant {classes}">
  <!-- <Stack> size not working
  <Stack>
    <vbox class="video" title={label}>
      <Video {video} />
    </vbox>
    <vbox flex class="name-container">
      <hbox class="name">{label}</hbox>
    </vbox>
  </Stack>
  -->
  <vbox class="video" title={label}>
    {#if video instanceof ParticipantVideo}
      <img src={video.participant.picture} alt={video.participant.name} />
    {:else if video instanceof SelfVideo}
      <img src={appGlobal.me.picture} alt="You" />
    {/if}
  </vbox>
</vbox>

<script lang="ts">
  import { type VideoStream, ParticipantVideo, SelfVideo } from "../../../logic/Meet/VideoStream";
  import { appGlobal } from "../../../logic/app";

  export let video: VideoStream;
  export let label: string;
  export let classes = "";
</script>

<style>
  img {
    aspect-ratio: 16/9;
    object-fit: cover;
  }
  .name-container {
    align-items: end;
    justify-content: end;
    align-self: end;
    justify-items: end;
  }
  .name {
    color: white;
    text-shadow: 1px;
    align-items: end;
    justify-content: end;
    align-self: end;
    justify-items: end;
  }
</style>
