<hbox class="search" class:has-search={searchInput}>
  <SearchIcon size="16px" />
  <input type="search" bind:value={searchInput} {placeholder} on:input={onInput} />
  {#if searchInput}
    <RoundButton icon={XIcon} iconSize="16px" padding="2px" border={false}
      on:click={onClear} />
  {/if}
</hbox>

<script lang="ts">
  import RoundButton from "./RoundButton.svelte";
  import SearchIcon from "lucide-svelte/icons/search";
  import XIcon from "lucide-svelte/icons/x";

  export let placeholder = "Search";
  /** out only */
  export let searchTerm: string;

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
    searchInput = null;
    searchTerm = null;
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
