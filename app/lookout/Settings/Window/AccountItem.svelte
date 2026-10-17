<button class="entry account" class:open={isOpen} class:selected={isOpen && pages.length == 1}
  role="treeitem" aria-expanded={pages.length > 1 ? isOpen : undefined} aria-selected={isOpen}
  title={$account.name}
  on:click={() => selection = { category, account, accountPage: "general" }}>
  <svelte:component this={icon} size={16} />
  <span class="name">{$account.name}</span>
</button>
{#if isOpen && pages.length > 1}
  {#each pages as page (page.id)}
    <button class="entry page" class:selected={selection.accountPage == page.id}
      role="treeitem" aria-selected={selection.accountPage == page.id}
      on:click={() => selection = { category, account, accountPage: page.id }}>
      {page.label}
    </button>
  {/each}
{/if}

<script lang="ts">
  import type { Account } from "../../../logic/Abstract/Account";
  import type { OptionsCategory } from "../SettingsDialogs";
  import { OptionsNavigation, type OptionsSelection } from "./OptionsNavigation";

  export let account: Account;
  export let category: OptionsCategory;
  export let icon: ConstructorOfATypedSvelteComponent;
  export let selection: OptionsSelection;

  $: isOpen = selection.account == account;
  $: pages = OptionsNavigation.pagesOf($account);
</script>

<style>
  .name {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
</style>
