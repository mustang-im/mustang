<vbox flex class="filetypes">
  <FastList items={new ArrayColl(genericFileTypes)} bind:selectedItem={selectedFileType} bind:selectedItems={selectedFileTypes}
    columns="auto">
    <svelte:fragment slot="header">
      <hbox class="header">{$t`File type`}</hbox>
    </svelte:fragment>
    <svelte:fragment slot="row" let:item={fileType}>
      <hbox class="row">{fileType.name}</hbox>
    </svelte:fragment>
  </FastList>
</vbox>

<script lang="ts">
  import { genericFileTypes, FileType } from '../../logic/Files/MIMETypes';
  import FastList from '../Shared/FastList.svelte';
  import { ArrayColl, type Collection } from 'svelte-collections';
  import { t } from '../../l10n/l10n';

  let selectedFileType: FileType; /* in/out */
  export let selectedFileTypes: Collection<FileType>;
</script>

<style>
  .filetypes :global(.row hbox) {
    font-size: 14px;
  }
  .header {
    padding-inline-start: 10px !important;
    color: grey;
    font-size: 12px;
  }
</style>
