<iframe
  src={file.url}
  width={size} height={size}
  title={file.name}
  />

<script lang="ts">
  import { File } from "../../../logic/Files/File";

  export let file: File;
  export let size = 16;
</script>
