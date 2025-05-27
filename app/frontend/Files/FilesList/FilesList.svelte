<Scroll>
  <grid class="files-list">
    <hbox class="name header">{$t`File name`}</hbox>
    <hbox class="type header">{$t`File type`}</hbox>
    <hbox class="size header">{$t`Size`}</hbox>
    <hbox class="time header">{$t`Last mod`}</hbox>

    <FileOrDirLines {files} {dirs} />
  </grid>
</Scroll>

<script lang="ts">
  import { File } from "../../../logic/Files/File";
  import { Directory } from "../../../logic/Files/Directory";
  import type { Collection } from "svelte-collections";
  import FileOrDirLines from "./FileOrDirLines.svelte";
  import Scroll from "../../Shared/Scroll.svelte";
  import { t } from "../../../l10n/l10n";

  export let files: Collection<File>;
  export let dirs: Collection<Directory>;
</script>

<style>
  .files-list {
    display: grid;
    grid-template-columns: auto max-content max-content max-content;
  }
  .header {
    opacity: 50%;
    font-weight: 300;
    padding-inline-start: 8px;
    padding-inline-end: 8px;
    border-bottom: 1px dotted var(--border);
    border-right: 1px dotted var(--border);
  }
  .time, .size {
    justify-content: end;
  }
  .name {
    padding-inline-start: 16px;
  }
  .time {
    padding-inline-end: 16px;
  }
</style>
