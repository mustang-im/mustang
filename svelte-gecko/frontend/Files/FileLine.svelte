<hbox class="firstColumn">
  {#each {length: indent} as _}
    <hbox class="indention" />
  {/each}
  <button class="icon" >
    <Icon data={fileO} scale={1} />
  </button>
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
<hbox class="time">
  {getDateString(file.lastMod)}
</hbox>

<script lang="ts">
  import type { File } from "../../logic/Files/File";
  import Icon from 'svelte-awesome';
  import fileO from 'svelte-awesome/icons/fileO';
  import { getDateString } from "../Util/date";

  export let file: File;
  export let indent = 0;
</script>

<style>
  .icon, .name, .type, .size, .time {
    padding-left: 8px;
    padding-right: 8px;
  }
  .icon {
    padding-left: 16px;
  }
  .time {
    padding-right: 16px;
  }
  .icon {
    align-self: center;
    border: none;
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
  .time {
    justify-content: end;
    min-width: 5em;
  }
</style>
