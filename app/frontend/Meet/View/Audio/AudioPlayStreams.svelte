{#each $audioOnlyStreams.each as audio (audio.id)}
  <AudioPlay audioOnly={audio} />
{/each}

<script lang="ts">
  import type { VideoStream } from "../../../../logic/Meet/VideoStream";
  import AudioPlay from "./AudioPlay.svelte";
  import type { Collection } from "svelte-collections";

  export let audioOnlyStreams: Collection<VideoStream>;
</script>
