<vbox class="options-tree" role="tree" aria-label={$t`Categories`}>
  {#each groups as group, groupIndex}
    {#if groupIndex > 0}
      <hbox class="separator" />
    {/if}
    {#each group as entry (entry.id)}
      <button class="entry category" class:selected={entry.id == selection.category && !selection.account}
        role="treeitem" aria-selected={entry.id == selection.category && !selection.account}
        on:click={() => selection = { category: entry.id, account: null, accountPage: "general" }}>
        {entry.label}
      </button>
      {#if entry.id == "mail"}
        {#each $mailAccounts.each as account (account.id)}
          <AccountItem {account} category={entry.id} icon={MailIcon} bind:selection />
        {/each}
        <button class="entry add" on:click={() => onAddAccount(entry.id)}><AddIcon size={14} />{$t`Add Account…`}</button>
      {:else if entry.id == "calendar"}
        {#each $calendars.each as account (account.id)}
          <AccountItem {account} category={entry.id} icon={CalendarIcon} bind:selection />
        {/each}
        <button class="entry add" on:click={() => onAddAccount(entry.id)}><AddIcon size={14} />{$t`Add Calendar…`}</button>
      {:else if entry.id == "people"}
        {#each $addressbooks.each as account (account.id)}
          <AccountItem {account} category={entry.id} icon={AddressbookIcon} bind:selection />
        {/each}
        <button class="entry add" on:click={() => onAddAccount(entry.id)}><AddIcon size={14} />{$t`Add Address Book…`}</button>
      {/if}
    {/each}
  {/each}
</vbox>

<script lang="ts">
  import type { OptionsCategory } from "../SettingsDialogs";
  import type { OptionsSelection } from "./OptionsNavigation";
  import { appGlobal } from "../../../logic/app";
  import AccountItem from "./AccountItem.svelte";
  import MailIcon from "lucide-svelte/icons/mail";
  import CalendarIcon from "lucide-svelte/icons/calendar";
  import AddressbookIcon from "lucide-svelte/icons/book-user";
  import AddIcon from "lucide-svelte/icons/plus";
  import { t } from "../../../l10n/l10n";

  export let groups: { id: OptionsCategory, label: string }[][];
  export let selection: OptionsSelection;
  export let onAddAccount: (category: OptionsCategory) => void;

  const mailAccounts = appGlobal.emailAccounts;
  const calendars = appGlobal.calendars;
  const addressbooks = appGlobal.addressbooks;
</script>

<style>
  .options-tree {
    flex-shrink: 0;
    width: 220px;
    padding: 4px;
    border: 1px solid var(--lo-border);
    border-radius: var(--lo-radius-small);
    background-color: var(--lo-pane-alt-bg);
    overflow-y: auto;
  }
  .options-tree :global(.entry) {
    position: relative;
    display: flex;
    flex-direction: row;
    align-items: center;
    flex-shrink: 0;
    gap: 8px;
    min-width: 0;
    height: 32px;
    padding: 0 12px;
    border: none;
    border-radius: var(--lo-radius-small);
    background: none;
    color: var(--lo-fg);
    font: inherit;
    text-align: start;
    cursor: pointer;
  }
  .options-tree :global(.entry:hover) {
    background-color: var(--lo-hover-bg);
  }
  .options-tree :global(.entry.selected) {
    background-color: var(--lo-selected-bg);
    font-weight: 600;
  }
  .options-tree :global(.entry.selected::before) {
    content: "";
    position: absolute;
    inset-inline-start: 0;
    top: 8px;
    bottom: 8px;
    width: 3px;
    border-radius: 2px;
    background-color: var(--lo-accent);
  }
  .options-tree :global(.entry.account) {
    height: 30px;
    padding-inline-start: 24px;
  }
  .options-tree :global(.entry.account svg) {
    flex-shrink: 0;
    color: var(--lo-accent-text);
  }
  .options-tree :global(.entry.account.open) {
    font-weight: 600;
  }
  .options-tree :global(.entry.page) {
    height: 28px;
    padding-inline-start: 48px;
  }
  .entry.add {
    height: 28px;
    padding-inline-start: 24px;
    color: var(--lo-accent-text);
    font-size: var(--lo-font-size-small);
  }
  .separator {
    margin: 6px 8px;
    border-block-start: 1px solid var(--lo-divider);
  }
</style>
