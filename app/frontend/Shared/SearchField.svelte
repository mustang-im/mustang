<hbox class="search">
  <SearchIcon size="16px" />
  <input type="search" bind:value={searchInput} {placeholder} />
  {#if searchInput}
    <RoundButton icon={XIcon} iconSize="16px" padding="4px" border={false}
      on:click={() => searchInput = undefined} />
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
  $: searchTerm = searchInput?.toLowerCase();
</script>

<style>
  .search {
    margin: 0px 12px 8px 12px;
    border: 1px solid #A1E4DA;
    padding-left: 8px;
    padding-right: 4px;
    border-radius: 100px;
    background-color: white;
    align-items: center;
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
  }
  input::placeholder {
    color: #808080;
  }

  .search :global(.button) {
    background-color: transparent;
  }
</style>
