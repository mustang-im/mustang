<audio
  src={$file.url}
  controls
  title={$file.name}
  />

<script lang="ts">
  import { File } from "../../../logic/Files/File";

  export let file: File;
</script>

<script lang="ts" context="module">
  export const kSupportedExt = ["mp3", "mp2", "mp2a", "m2a", "m3a", "mpga", "wav"];
</script>
