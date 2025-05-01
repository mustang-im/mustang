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
    <Video {video} />
  </vbox>
</vbox>

<script lang="ts">
  import type { VideoStream } from "../../../../logic/Meet/VideoStream";
  import Video from "./Video.svelte";

  export let video: VideoStream;
  export let label: string;
  export let classes = "";
</script>

<style>
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
