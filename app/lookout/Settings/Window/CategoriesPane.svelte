<vbox class="settings-categories-pane" role="tree" aria-label={$t`Categories`}>
  {#if account}
    <AccountItem {account} category={null} />
  {:else}
    {#each $categories.each as category (category.id)}
      <CategoryItem {category} />
    {/each}
  {/if}
</vbox>

<script lang="ts">
  import type { SettingsCategory } from "../../../frontend/Settings/SettingsCategory";
  import type { Account } from "../../../logic/Abstract/Account";
  import CategoryItem from "./CategoryItem.svelte";
  import AccountItem from "./AccountItem.svelte";
  import type { Collection } from "svelte-collections";
  import { t } from "../../../l10n/l10n";

  export let categories: Collection<SettingsCategory>;
  export let account: Account = null;
</script>

<style>
  .settings-categories-pane {
    flex-shrink: 0;
    width: 240px;
    padding: 4px;
    border: 1px solid var(--lo-border);
    border-radius: var(--lo-radius-small);
    background-color: var(--lo-pane-alt-bg);
    overflow-y: auto;
  }
  .settings-categories-pane :global(.entry) {
    position: relative;
    display: flex;
    flex-direction: row;
    align-items: center;
    flex-shrink: 0;
    gap: 8px;
    min-width: 0;
    height: 32px;
    padding-block: 0;
    padding-inline-end: 12px;
    border: none;
    border-radius: var(--lo-radius-small);
    background: none;
    color: var(--lo-fg);
    font: inherit;
    text-align: start;
    cursor: pointer;
  }
  .settings-categories-pane :global(.entry:hover) {
    background-color: var(--lo-hover-bg);
  }
  .settings-categories-pane :global(.entry.selected) {
    background-color: var(--lo-selected-bg);
    font-weight: 600;
  }
  .settings-categories-pane :global(.entry.selected::before) {
    content: "";
    position: absolute;
    inset-inline-start: 0;
    top: 8px;
    bottom: 8px;
    width: 3px;
    border-radius: 2px;
    background-color: var(--lo-accent);
  }
  .settings-categories-pane :global(.entry svg) {
    flex-shrink: 0;
    color: var(--lo-accent-text);
  }
</style>
