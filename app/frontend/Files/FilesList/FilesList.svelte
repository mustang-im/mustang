<Scroll>
  <grid class="files-list">
    <hbox class="name header">{$t`File name`}</hbox>
    <hbox class="type header">{$t`File type`}</hbox>
    <hbox class="size header">{$t`Size`}</hbox>
    <hbox class="time header">{$t`Last mod`}</hbox>

    {#each $dirs?.each as file }
      <DirectoryLine dir={file} />
    {/each}
    {#each $files?.each as file }
      <FileLine {file} />
    {/each}
  </grid>
</Scroll>

<script lang="ts">
  import { File } from "../../../logic/Files/File";
  import { Directory } from "../../../logic/Files/Directory";
  import type { Collection } from "svelte-collections";
  import DirectoryLine from "./DirectoryLine.svelte";
  import FileLine from "./FileLine.svelte";
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
    padding-inline-start: 8px;
    padding-inline-end: 8px;
    border-bottom: 1px dotted var(--border);
    border-right: 1px dotted var(--border);
  }
  .name {
    padding-inline-start: 16px;
  }
  .time {
    padding-inline-end: 16px;
  }
</style>
