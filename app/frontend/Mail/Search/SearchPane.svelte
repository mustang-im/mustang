<vbox flex class="search">
  <hbox class="header-bar">
    <hbox class="header top">{$t`Search`}</hbox>
    <hbox flex />
    <hbox class="buttons top-right">
      <RoundButton icon={XIcon} iconSize="16px" padding="4px" border={true} classes="small"
        on:click={onClear} />
    </hbox>
  </hbox>

  <Scroll>
    <hbox class="term font-normal">
      <SearchField bind:searchTerm={$globalSearchTerm}
        placeholder={$t`Mail content or subject`}
        bind:this={searchFieldEl} />
    </hbox>
    <hbox class="search-criteria">
      <SearchCriteria {search} showSearchTerm={false} {searchMessages} />
    </hbox>
  </Scroll>

  <hbox class="results-count">
    {#if searchMessages?.length > kLimit}
      {$t`More than ${kLimit} mails`}
    {:else if searchMessages}
      {$t`${searchMessages?.length} mails`}
    {/if}
  </hbox>
  {#if !expandedCreateRule}
    <ExpandSection headerBox={false} bind:expanded={expandedSavedSearch}>
      <hbox class="header" slot="header">
        {$t`Save search as folder`}
      </hbox>
      <SavedSearchUI {search} on:close={onClear} />
    </ExpandSection>
  {/if}
  {#if !expandedSavedSearch}
    <ExpandSection headerBox={false} bind:expanded={expandedCreateRule}>
      <hbox class="header" slot="header">
        {$t`Create rule`}
      </hbox>
      <RulesFromSearchUI {search} on:close={onClear} />
    </ExpandSection>
  {/if}
</vbox>

<script lang="ts">
  import { newSearchEMail } from "../../../logic/Mail/Store/setStorage";
  import { globalSearchTerm } from "../../AppsBar/selectedApp";
  import type { EMail } from "../../../logic/Mail/EMail";
  import { selectedMessage } from "../Selected";
  import SearchCriteria from "./SearchCriteria.svelte";
  import SavedSearchUI from "./SavedSearchUI.svelte";
  import RulesFromSearchUI from "./RulesFromSearchUI.svelte";
  import SearchField from "../../Shared/SearchField.svelte";
  import ExpandSection from "../../Shared/ExpandSection.svelte";
  import Scroll from "../../Shared/Scroll.svelte";
  import RoundButton from "../../Shared/RoundButton.svelte";
  import XIcon from "lucide-svelte/icons/x";
  import { showError } from "../../Util/error";
  import { ArrayColl } from "svelte-collections";
  import debounce from "lodash/debounce";
  import { t } from "../../../l10n/l10n";
  import { createEventDispatcher, onMount } from 'svelte';
  const dispatchEvent = createEventDispatcher<{ clear: void }>();

  /** The search result
   * in/out */
  export let searchMessages: ArrayColl<EMail> | null = null;

  let isOpen = true;
  const kLimit = 200;
  let search = newSearchEMail();
  let tags = search.tags;
  let attachmentTypes = search.hasAttachmentMIMETypes;

  $: isOpen && $globalSearchTerm, $search, $tags, $attachmentTypes, startSearchDebounced();
  const startSearchDebounced = debounce(() => startSearch(), 300);
  async function startSearch() {
    try {
      let searchTerm = $globalSearchTerm;
      $selectedMessage = null;
      if (searchTerm == null) {
        searchMessages = null;
        return;
      }
      searchMessages = new ArrayColl<EMail>();

      search.bodyText = searchTerm;
      let result = await search.startSearch(kLimit + 1);
      if (!isOpen) {
        return;
      }
      searchMessages = result;
      $selectedMessage = searchMessages.first;
    } catch (ex) {
      showError(ex);
    }
  }

  function onClear() {
    isOpen = false;
    $globalSearchTerm = null;
    searchMessages = null;
    dispatchEvent("clear");
  }

  // window title | search field | (x) button
  $: if ($globalSearchTerm == null) dispatchEvent("clear");

  let searchFieldEl: SearchField;
  onMount(() => {
    if (!$globalSearchTerm) {
      searchFieldEl.focus();
    }
  });

  let expandedSavedSearch = false;
  let expandedCreateRule = false;
</script>

<style>
  .search {
    margin: 8px 0px 12px 24px;
  }
  .header-bar {
    margin-inline-end: 8px;
  }
  .header.top {
    margin-block-start: 8px;
  }
  .header {
    font-size: 20px;
    font-weight: bold;
  }
  .buttons.top-right {
    align-items: start;
  }
  .term {
    margin: 8px 0px;
    align-items: center;
  }
  .term :global(.search) {
    margin: 0px 8px;
  }
  .term :global(input) {
    font-size: 16px;
  }
  .search-criteria {
    margin: 8px 0px 12px 24px;
  }
  .results-count {
    margin: 12px 24px;
    justify-content: end;
  }
</style>
