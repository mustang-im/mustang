<hbox class="firstColumn">
  {#each {length: indent} as _}
    <hbox class="indention" />
  {/each}
  <hbox class="icon">
    <Icon data={fileO} scale={1} />
  </hbox>
  <hbox class="name">
    {file.nameWithoutExt}
  </hbox>
</hbox>
<hbox class="type">
  {file.ext}
</hbox>
<hbox class="size">
  {file.length} bytes
</hbox>

<script lang="ts">
  import type { File } from "../../logic/Files/File";
  import Icon from 'svelte-awesome';
  import fileO from 'svelte-awesome/icons/fileO';

  export let file: File;
  export let indent = 0;
</script>

<style>
  .icon, .name, .type, .size {
    margin-right: 16px;
  }
  .icon {
    margin-left: 16px;
    align-self: center;
  }
  .indention {
    margin-left: 16px;
  }
  .type {
    min-width: 3.5em;
  }
  .size {
    justify-content: end;
    min-width: 8em;
  }
</style>
