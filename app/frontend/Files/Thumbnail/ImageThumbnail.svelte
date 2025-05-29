<img
  src={file.url}
  width={size} height={size}
  title={file.name} alt=""
  />

<script lang="ts">
  import { File } from "../../../logic/Files/File";

  export let file: File;
  export let size = 16;
</script>
