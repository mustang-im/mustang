<vbox class="mail-search-box" bind:this={boxEl}>
  <hbox class="search" class:has-search={!!typed}>
    <button type="button" class="scope" bind:this={scopeButton}
      title={$t`Choose where to search`}
      aria-haspopup="menu" aria-expanded={isScopeOpen}
      on:click|stopPropagation={() => isScopeOpen = !isScopeOpen}>
      <span class="scope-label">{MailSearch.scopeLabel(scope)}</span>
      <ChevronIcon size={14} />
    </button>
    <hbox class="divider" />
    <SearchIcon size={16} />
    <input type="search" bind:value={typed} bind:this={inputEl}
      placeholder={$t`Search`} spellcheck={false}
      on:input={onInput} on:keydown={onKeyDown} />
    {#if typed}
      <button type="button" class="icon-button" title={$t`Clear`} aria-label={$t`Clear`}
        on:click={onClear}>
        <ClearIcon size={16} />
      </button>
    {/if}
    <button type="button" class="icon-button advanced" class:open={$isAdvancedOpen}
      title={$t`Advanced Search - Narrow your search with options like sender, date, scope and attachments`}
      aria-label={$t`Advanced Search`} aria-expanded={$isAdvancedOpen}
      on:click={() => $isAdvancedOpen ? closeAdvanced() : openAdvanced()}>
      <svelte:component this={$isAdvancedOpen ? ChevronUpIcon : ChevronIcon} size={16} />
    </button>
  </hbox>
  <Menu bind:isMenuOpen={isScopeOpen} anchor={scopeButton} placement="bottom-start">
    {#each scopes as option}
      <MenuItem label={MailSearch.scopeLabel(option)}
        icon={option == scope ? CheckIcon : BlankIcon}
        disabled={!MailSearch.isScopeAvailable(option, $selectedAccount, $selectedFolder) && $t`Select a folder of an account first`}
        onClick={() => MailSearch.update({ scope: option })} />
    {/each}
  </Menu>
  {#if $isAdvancedOpen && draft}
    <vbox class="advanced-popup">
      <AdvancedSearchPanel bind:draft account={$selectedAccount} folder={$selectedFolder} onSearch={onAdvancedSearch} />
    </vbox>
  {/if}
</vbox>
<svelte:window on:mousedown={onClickOutside} />

<script lang="ts">
  import { globalSearchTerm } from "../../../frontend/AppsBar/selectedApp";
  import { selectedAccount, selectedFolder } from "../../../frontend/Mail/Selected";
  import { MailSearch, SearchScope } from "./MailSearch";
  import { AdvancedSearchDraft } from "./AdvancedSearchDraft";
  import AdvancedSearchPanel from "./AdvancedSearchPanel.svelte";
  import Menu from "../../../frontend/Shared/Menu/Menu.svelte";
  import MenuItem from "../../../frontend/Shared/Menu/MenuItem.svelte";
  import BlankIcon from "../../Shared/Menu/BlankIcon.svelte";
  import SearchIcon from "lucide-svelte/icons/search";
  import ClearIcon from "lucide-svelte/icons/x";
  import ChevronIcon from "lucide-svelte/icons/chevron-down";
  import ChevronUpIcon from "lucide-svelte/icons/chevron-up";
  import CheckIcon from "lucide-svelte/icons/check";
  import { get } from "svelte/store";
  import { t } from "../../../l10n/l10n";

  const options = MailSearch.options;
  const isAdvancedOpen = MailSearch.isAdvancedSearchOpen;
  const scopes = [SearchScope.AllAccounts, SearchScope.CurrentAccount, SearchScope.CurrentFolder];
  $: scope = MailSearch.effectiveScope($options, $selectedAccount, $selectedFolder);

  let boxEl: HTMLElement;
  let inputEl: HTMLInputElement;
  let scopeButton: HTMLButtonElement;
  let isScopeOpen = false;
  let draft: AdvancedSearchDraft = null;

  let typed = $globalSearchTerm ?? "";
  $: takeGlobalTerm($globalSearchTerm);
  function takeGlobalTerm(term: string | null) {
    if ((term ?? "") != typed.toLowerCase()) {
      typed = term ?? "";
    }
  }

  function onInput() {
    $globalSearchTerm = typed.toLowerCase() || null;
  }

  function onClear() {
    typed = "";
    $globalSearchTerm = null;
    inputEl?.focus();
  }

  function onKeyDown(event: KeyboardEvent) {
    if (event.key == "Escape" && $isAdvancedOpen) {
      event.preventDefault();
      event.stopPropagation();
      closeAdvanced();
    }
  }

  $: updateDraft($isAdvancedOpen);
  function updateDraft(isOpen: boolean) {
    draft = isOpen ? draft ?? new AdvancedSearchDraft(MailSearch.current(), get(globalSearchTerm)) : null;
  }

  function openAdvanced() {
    $isAdvancedOpen = true;
  }

  function closeAdvanced() {
    $isAdvancedOpen = false;
  }

  function onAdvancedSearch() {
    MailSearch.options.set(draft.toOptions());
    $globalSearchTerm = draft.searchTerm?.toLowerCase() ?? null;
    closeAdvanced();
  }

  function onClickOutside(event: MouseEvent) {
    if (!$isAdvancedOpen) {
      return;
    }
    let target = event.target as HTMLElement;
    if (boxEl?.contains(target) || target?.closest?.("dialog, .popup, .submenu-layer")) {
      return;
    }
    closeAdvanced();
  }
</script>

<style>
  .mail-search-box {
    position: relative;
    flex: 1 1 0;
    min-width: 0;
    app-region: no-drag;
  }
  .search {
    height: 30px;
    box-sizing: border-box;
    padding: 0 2px 0 0;
    gap: 6px;
    align-items: center;
    background-color: var(--lo-input-bg);
    border: 1px solid var(--lo-border);
    border-radius: var(--lo-radius-small);
    color: var(--lo-fg-secondary);
  }
  .search:hover {
    border-color: var(--lo-border-strong);
  }
  .search:focus-within {
    border-color: var(--lo-border-strong);
    border-bottom: 2px solid var(--lo-accent);
  }
  .scope {
    display: flex;
    align-items: center;
    gap: 6px;
    height: 100%;
    max-width: 40%;
    padding: 0 8px 0 10px;
    border: none;
    border-radius: var(--lo-radius-small) 0 0 var(--lo-radius-small);
    background-color: transparent;
    color: var(--lo-fg);
    font: inherit;
    font-size: 13px;
    white-space: nowrap;
  }
  .scope:hover,
  .scope[aria-expanded="true"] {
    background-color: var(--lo-hover-bg);
  }
  .scope-label {
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .divider {
    align-self: stretch;
    width: 1px;
    margin: 5px 4px 5px 0;
    background-color: var(--lo-divider);
  }
  input {
    flex: 1 1 0;
    min-width: 0;
    border: none;
    background-color: transparent;
    color: var(--lo-fg);
    font: inherit;
    font-size: var(--lo-font-size);
    outline: none;
  }
  input::-webkit-search-cancel-button {
    display: none;
  }
  .icon-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 24px;
    padding: 0;
    border: none;
    border-radius: var(--lo-radius-small);
    background-color: transparent;
    color: var(--lo-fg-secondary);
  }
  .icon-button:hover,
  .icon-button.open {
    background-color: var(--lo-hover-bg);
    color: var(--lo-fg);
  }
  .advanced-popup {
    position: absolute;
    top: calc(100% + 4px);
    inset-inline: 0;
    min-width: 440px;
    z-index: 20;
    padding: 16px;
    border: 1px solid var(--lo-border);
    border-radius: var(--lo-radius);
    background-color: var(--lo-pane-bg);
    box-shadow: var(--lo-shadow-popup);
    color: var(--lo-fg);
    app-region: no-drag;
  }
</style>
