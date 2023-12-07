<vbox flex class="participant">
  <Stack>
    <vbox class="video">
      <Video {video} />
    </vbox>
    <vbox flex class="name-container">
      <hbox class="name">{label}</hbox>
    </vbox>
  </Stack>
</vbox>

<script lang="ts">
  import type { VideoStream } from "../../logic/Meet/VideoStream";
  import Video from "./Video.svelte";
  import Stack from "../Shared/Stack.svelte";

  export let video: VideoStream;
  export let label: string;
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
