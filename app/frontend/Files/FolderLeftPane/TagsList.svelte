<vbox class="tags">
  <hbox class="header font-smallest">{$t`Tags`}</hbox>
  <vbox class="list">
    <TagSelector tags={availableTags} {selectedTags} canAdd={false}
      on:select={() => catchErrors(onSelect)}
      on:unselect={() => catchErrors(onSelect)}
      />
  </vbox>
</vbox>

<script lang="ts">
  import type { FileOrDirectory } from '../../../logic/Files/FileOrDirectory';
  import { Directory } from '../../../logic/Files/Directory';
  import { availableTags, type Tag } from '../../../logic/Abstract/Tag';
  import TagSelector from '../../Shared/Tag/TagSelector.svelte';
  import { catchErrors } from '../../Util/error';
  import { SetColl, Collection } from 'svelte-collections';
  import { t } from '../../../l10n/l10n';
  import { createEventDispatcher, onDestroy } from 'svelte';
  const dispatchEvent = createEventDispatcher<{ clear: void }>();

  export let selectedTags = new SetColl<Tag>();
  export let folder: Directory;
  export let searchFiles: Collection<FileOrDirectory> | null = null;

  $: folder, onSelect();

  async function onSelect() {
    if (selectedTags.hasItems) {
      let search = null; // TODO newSearchFiles();
      search.folder = folder;
      search.tags.replaceAll(selectedTags);
      searchFiles = await search.startSearch();
    } else {
      clear();
    }
  }

  function clear() {
    searchFiles = null;
    dispatchEvent("clear");
  }

  onDestroy(clear)
</script>

<style>
  .tags :global(.row hbox) {
    font-size: 14px;
  }
  .header {
    padding-inline-start: 10px !important;
    color: grey;
  }
  .list {
    margin-block-start: 8px;
    margin-inline-start: 10px;
  }
</style>
