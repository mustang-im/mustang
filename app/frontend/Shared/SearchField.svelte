<hbox class="search" class:has-search={searchInput}>
  <SearchIcon size="16px" />
  <input type="search" bind:value={searchInput} placeholder={placeholder ?? $t`Search`} on:input={onInput} bind:this={inputEl} />
  {#if searchInput}
    <RoundButton icon={XIcon} iconSize="16px" padding="2px" border={false}
      on:click={onClear} />
  {/if}
</hbox>

<script lang="ts">
  import RoundButton from "./RoundButton.svelte";
  import SearchIcon from "lucide-svelte/icons/search";
  import XIcon from "lucide-svelte/icons/x";
  import { createEventDispatcher } from "svelte";
  import { t } from "svelte-i18n-lingui";
  const dispatchEvent = createEventDispatcher();

  /** out only */
  export let searchTerm: string;
  /** Text to show in the empty search field.
   * Default "Search" */
  export let placeholder: string = null;

  let searchInput: string;
  $: searchInput = searchTerm;
  function onInput() {
    if (!searchInput) {
      searchTerm = null;
      return;
    }
    if (searchTerm == searchInput) {
      return;
    }
    searchTerm = searchInput?.toLowerCase();
  }
  function onClear() {
    searchTerm = null;
    dispatchEvent("clear");
  }

  let inputEl: HTMLInputElement;
  export function focus() {
    inputEl.focus();
  }
</script>

<style>
  .search {
    align-items: center;
    border: 1px solid #A1E4DA;
    padding-left: 8px;
    padding-right: 4px;
    border-radius: 100px;
    background-color: field;
    color: fieldtext;
  }
  .search.has-search {
    background-color: var(--inverted-bg);
    color: var(--inverted-fg);
  }
  .search :global(svg) {
    color: #808080;
  }
  input[type="search"] {
    width: 100%;
    height: 24px;
    border: none;
    margin-left: 4px;
    border-radius: 100px;
    background-color: inherit;
    color: inherit;
  }
  input::placeholder {
    color: #808080;
  }
  input::-webkit-search-cancel-button {
    display: none;
  }

  .search :global(.button) {
    background-color: transparent;
  }
</style>
