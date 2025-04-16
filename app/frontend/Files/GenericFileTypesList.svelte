<vbox flex class="filetypes">
  <FastList items={new ArrayColl(genericFileTypes)} bind:selectedItem={selectedFileType} bind:selectedItems={selectedFileTypes}
    columns="auto">
    <svelte:fragment slot="header">
      <hbox class="header font-smallest">{$t`File type`}</hbox>
    </svelte:fragment>
    <svelte:fragment slot="row" let:item={fileType}>
      <hbox class="row">{fileType.name}</hbox>
    </svelte:fragment>
  </FastList>
</vbox>

<script lang="ts">
  import { genericFileTypes, FileType } from '../../logic/Files/MIMETypes';
  import FastList from '../Shared/FastList.svelte';
  import { avoidLoop } from '../Util/svelte';
  import { assert } from '../../logic/util/util';
  import { ArrayColl, SetColl } from 'svelte-collections';
  import { t } from '../../l10n/l10n';

  /** in/out */
  export let selectedMIMETypes: SetColl<string> | null;

  let selectedFileType: FileType; /* in/out */
  let selectedFileTypes = new ArrayColl<FileType>();
  let inSetter;

  // UI control to in/out property
  $: $selectedFileTypes, avoidLoop(toMIMEType, inSetter);
  function toMIMEType() {
    let mimetypes = $selectedFileTypes.contents.flatMap(type => type.mimeTypes);
    if (mimetypes) {
      selectedMIMETypes ??= new SetColl<string>();
      selectedMIMETypes.replaceAll(mimetypes);
    } else {
      selectedMIMETypes = null;
    }
  }

  /** Property to UI control */
  $: selectedMIMETypes, avoidLoop(toFileTypes, inSetter);
  function toFileTypes() {
    selectedFileTypes.clear();
    if (!selectedMIMETypes.length) {
      return;
    }
    for (let fileType of genericFileTypes) {
      for (let mimeType of selectedMIMETypes) {
        if (fileType.mimeTypes.includes(mimeType)) {
          selectedFileTypes.add(fileType);
          break;
        }
      }
    }
    assert(selectedFileTypes.hasItems, `Selected mime types ${selectedMIMETypes} not found in file types`);
  }
</script>

<style>
  .filetypes :global(.row hbox) {
    font-size: 14px;
  }
  .header {
    padding-inline-start: 10px !important;
    color: grey;
  }
</style>
