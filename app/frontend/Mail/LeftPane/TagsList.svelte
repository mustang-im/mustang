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
  import { availableTags, type Tag } from '../../../logic/Abstract/Tag';
  import type { Folder } from '../../../logic/Mail/Folder';
  import type { EMail } from '../../../logic/Mail/EMail';
  import { newSearchEMail } from '../../../logic/Mail/Store/setStorage';
  import TagSelector from '../../Shared/Tag/TagSelector.svelte';
  import { catchErrors } from '../../Util/error';
  import { ArrayColl, SetColl } from 'svelte-collections';
  import { t } from '../../../l10n/l10n';
  import { createEventDispatcher, onDestroy, onMount } from 'svelte';
  const dispatchEvent = createEventDispatcher<{ clear: void }>();

  export let selectedTags = new SetColl<Tag>();
  export let folder: Folder;
  export let searchMessages: ArrayColl<EMail> | null = null;

  $: folder, onSelect();

  async function onSelect() {
    if (selectedTags.hasItems) {
      let search = newSearchEMail();
      search.folder = folder;
      search.tags.replaceAll(selectedTags);
      searchMessages = await search.startSearch();
    } else {
      clear();
    }
  }

  function clear() {
    searchMessages = null;
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
