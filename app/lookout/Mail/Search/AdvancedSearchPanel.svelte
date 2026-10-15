<vbox class="advanced-search">
  <grid class="fields">
    {#if showScope}
      <label for="advanced-search-scope">{$t`Search In`}</label>
      <select id="advanced-search-scope" class="lo-text-field" bind:value={draft.scope}>
        {#each scopes as scope}
          <option value={scope} disabled={!MailSearch.isScopeAvailable(scope, account, folder)}>{MailSearch.scopeLabel(scope)}</option>
        {/each}
      </select>
    {/if}
    {#if showKeywords}
      <label for="advanced-search-keywords">{$t`Keywords`}</label>
      <input id="advanced-search-keywords" class="underlined" type="text" bind:value={draft.keywords}
        title={$t`Words in the subject or the message text`}
        on:keydown={onEnter} />
    {/if}
    <span class="label">{$t`From`}</span>
    <hbox class="person-field underlined">
      {#if draft.from}
        <hbox class="person-chip">
          <PersonCircle name={draft.from.name} picture={draft.from.picture} size={20} />
          <span class="name">{draft.from.name}</span>
          <button type="button" class="chip-remove" title={$t`Remove`} aria-label={$t`Remove`}
            on:click={() => { draft.setFrom(null); draft = draft; }}>
            <RemoveIcon size={12} />
          </button>
        </hbox>
      {/if}
      <hbox flex />
      <button type="button" class="pick" title={$t`Select Names`} aria-label={$t`Select Names`}
        on:click={() => picking = Direction.From}>
        <AddressBookIcon size={16} />
      </button>
    </hbox>
    <span class="label">{$t`To`}</span>
    <hbox class="person-field underlined">
      {#if draft.to}
        <hbox class="person-chip">
          <PersonCircle name={draft.to.name} picture={draft.to.picture} size={20} />
          <span class="name">{draft.to.name}</span>
          <button type="button" class="chip-remove" title={$t`Remove`} aria-label={$t`Remove`}
            on:click={() => { draft.setTo(null); draft = draft; }}>
            <RemoveIcon size={12} />
          </button>
        </hbox>
      {/if}
      <hbox flex />
      <button type="button" class="pick" title={$t`Select Names`} aria-label={$t`Select Names`}
        on:click={() => picking = Direction.To}>
        <AddressBookIcon size={16} />
      </button>
    </hbox>
    <span class="label">{$t`Received`}</span>
    <hbox class="dates">
      <input class="underlined" type="date" bind:value={draft.startDate}
        aria-label={$t`Start Date`} title={$t`Start Date`} />
      <span class="lo-secondary">{$t`to`}</span>
      <input class="underlined" type="date" bind:value={draft.endDate}
        aria-label={$t`End Date`} title={$t`End Date`} />
    </hbox>
    <span class="label">{$t`Categories`}</span>
    <hbox class="categories-field">
      <button type="button" class="lo-text-field combo" bind:this={categoriesButton}
        disabled={!$tags.hasItems}
        on:click|stopPropagation={() => isCategoriesOpen = !isCategoriesOpen}>
        <hbox flex class="combo-value">
          {#each draft.tags as tag (tag)}
            <hbox class="category"><CategorySquare color={tag.color} />{tag.name}</hbox>
          {:else}
            <span class="lo-secondary">{$tags.hasItems ? $t`Any` : $t`No categories yet`}</span>
          {/each}
        </hbox>
        <ChevronIcon size={14} />
      </button>
      <Menu bind:isMenuOpen={isCategoriesOpen} anchor={categoriesButton} placement="bottom-start">
        <CategoryMenuItems selected={draft.tags} keepOpen onToggle={tag => { draft.toggleTag(tag); draft = draft; }} />
      </Menu>
    </hbox>
    <label for="advanced-search-read">{$t`Read status`}</label>
    <select id="advanced-search-read" class="lo-text-field" bind:value={draft.readStatus}>
      <option value={ReadStatus.All}>{$t`All`}</option>
      <option value={ReadStatus.Read}>{$t`Read`}</option>
      <option value={ReadStatus.Unread}>{$t`Unread`}</option>
    </select>
    <label for="advanced-search-size">{$t`Size`}</label>
    <select id="advanced-search-size" class="lo-text-field" bind:value={draft.size}>
      {#each [SizeRange.Any, ...SizeRanges.named] as size}
        <option value={size}>{SizeRanges.label(size)}</option>
      {/each}
    </select>
    <label for="advanced-search-attachments">{$t`Attachments`}</label>
    <hbox><input id="advanced-search-attachments" type="checkbox" bind:checked={draft.hasAttachment} /></hbox>
    <label for="advanced-search-flagged">{$t`Flagged`}</label>
    <hbox><input id="advanced-search-flagged" type="checkbox" bind:checked={draft.flagged} /></hbox>
    <label for="advanced-search-replied">{$t`Replied`}</label>
    <hbox><input id="advanced-search-replied" type="checkbox" bind:checked={draft.replied} /></hbox>
  </grid>
  <hbox class="buttons">
    <hbox flex />
    <DialogButton label={searchLabel ?? $t`Search`} primary onClick={onSearch} />
    <DialogButton label={$t`Clear filters`} onClick={() => { draft.clear(); draft = draft; }} />
  </hbox>
</vbox>
{#if picking}
  <SearchPersonDialog
    fieldLabel={picking == Direction.To ? $t`To` : $t`From`}
    person={picking == Direction.To ? draft.to : draft.from}
    onPick={onPicked}
    on:close={() => picking = null} />
{/if}

<script lang="ts">
  import type { Folder } from "../../../logic/Mail/Folder";
  import type { MailAccount } from "../../../logic/Mail/MailAccount";
  import type { Person } from "../../../logic/Abstract/Person";
  import { availableTags } from "../../../logic/Abstract/Tag";
  import { MailSearch, SearchScope } from "./MailSearch";
  import { AdvancedSearchDraft, ReadStatus } from "./AdvancedSearchDraft";
  import { SizeRange, SizeRanges } from "./SearchRanges";
  import CategoryMenuItems from "./CategoryMenuItems.svelte";
  import CategorySquare from "../Menu/CategorySquare.svelte";
  import SearchPersonDialog from "../Dialogs/SearchPersonDialog.svelte";
  import PersonCircle from "../../Shared/Person/PersonCircle.svelte";
  import DialogButton from "../../Shared/Dialog/DialogButton.svelte";
  import Menu from "../../Shared/Menu/Menu.svelte";
  import AddressBookIcon from "lucide-svelte/icons/book-user";
  import RemoveIcon from "lucide-svelte/icons/x";
  import ChevronIcon from "lucide-svelte/icons/chevron-down";
  import { t } from "../../../l10n/l10n";

  export let draft: AdvancedSearchDraft;
  export let account: MailAccount | null = null;
  export let folder: Folder | null = null;
  export let showScope = true;
  export let showKeywords = true;
  export let searchLabel: string = null;
  export let onSearch: () => void;

  enum Direction {
    From = "from",
    To = "to",
  }

  const scopes = [SearchScope.AllAccounts, SearchScope.CurrentAccount, SearchScope.CurrentFolder];
  const tags = availableTags;
  let categoriesButton: HTMLButtonElement;
  let isCategoriesOpen = false;
  let picking: Direction | null = null;

  function onPicked(person: Person | null) {
    if (picking == Direction.To) {
      draft.setTo(person);
    } else {
      draft.setFrom(person);
    }
    draft = draft;
  }

  function onEnter(event: KeyboardEvent) {
    if (event.key == "Enter") {
      event.preventDefault();
      onSearch();
    }
  }
</script>

<style>
  .advanced-search {
    gap: 12px;
  }
  .fields {
    grid-template-columns: max-content minmax(0, 1fr);
    grid-auto-rows: 32px;
    align-items: center;
    gap: 4px 16px;
  }
  .label, label {
    color: var(--lo-fg);
  }
  .underlined {
    box-sizing: border-box;
    height: 32px;
    padding: 0 4px;
    border: none;
    border-bottom: 1px solid var(--lo-input-border);
    background-color: transparent;
    color: var(--lo-fg);
    font: inherit;
  }
  input.underlined:focus,
  .person-field:focus-within {
    outline: none;
    border-bottom: 2px solid var(--lo-accent);
  }
  input[type="date"].underlined::-webkit-calendar-picker-indicator {
    opacity: 0.7;
  }
  select.lo-text-field {
    width: 100%;
  }
  .person-field {
    align-items: center;
    gap: 4px;
    min-width: 0;
  }
  input[type="checkbox"] {
    width: 16px;
    height: 16px;
    margin: 0;
  }
  .person-chip {
    align-items: center;
    gap: 6px;
    padding: 2px 4px 2px 2px;
    border-radius: 14px;
    background-color: var(--lo-accent-tint);
  }
  .person-chip .name {
    white-space: nowrap;
  }
  .chip-remove,
  .pick {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px;
    border: none;
    border-radius: var(--lo-radius-small);
    background-color: transparent;
    color: var(--lo-fg-secondary);
  }
  .chip-remove:hover,
  .pick:hover {
    background-color: var(--lo-hover-bg);
    color: var(--lo-fg);
  }
  .pick {
    color: var(--lo-accent-text);
  }
  .dates {
    align-items: center;
    gap: 12px;
  }
  .dates input {
    flex: 1 1 0;
    min-width: 0;
  }
  .combo {
    display: flex;
    align-items: center;
    gap: 6px;
    width: 100%;
    text-align: start;
  }
  .combo:disabled {
    color: var(--lo-fg-disabled);
  }
  .combo-value {
    gap: 10px;
    overflow: hidden;
    white-space: nowrap;
  }
  .category {
    align-items: center;
    gap: 4px;
  }
  .categories-field {
    min-width: 0;
  }
  .buttons {
    gap: 8px;
  }
</style>
