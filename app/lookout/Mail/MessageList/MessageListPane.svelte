<vbox flex class="message-list-pane lo-card" style:--message-columns={gridTemplate} bind:clientWidth={paneWidth}>
  <hbox class="list-header">
    {#if isSimplified}
      <span class="list-title" title={listTitle}>{listTitle}</span>
      <hbox flex />
      {#if !isSearchResult}
        <button class="header-button" class:active={hasFilter} bind:this={filterEl}
          on:click|stopPropagation={() => isFilterMenuOpen = !isFilterMenuOpen}
          title={$t`Filter`} aria-haspopup="menu">
          <FilterIcon size={16} />
          <span class="button-label">{$t`Filter`}</span>
        </button>
      {/if}
      <button class="header-button" bind:this={sortEl}
        on:click|stopPropagation={() => isSortMenuOpen = !isSortMenuOpen}
        title={$t`Sort`} aria-haspopup="menu">
        <SortIcon size={16} />
        <span class="button-label">{arrangeLabel}</span>
      </button>
    {:else if isSearchResult}
      <span class="results-title">{$t`Results`}</span>
    {:else}
      <hbox class="pivots" role="tablist">
        <button class="pivot" role="tab" class:active={!isUnreadOnly} aria-selected={!isUnreadOnly}
          on:click={() => setUnreadOnly(false)}>
          {$t`All`}
        </button>
        <button class="pivot" role="tab" class:active={isUnreadOnly} aria-selected={isUnreadOnly}
          on:click={() => setUnreadOnly(true)}>
          {$t`Unread`}
        </button>
      </hbox>
      <hbox class="pivots quick-filters">
        <button class="pivot icon-pivot" class:active={$quickSearch.isStarred === true} aria-pressed={$quickSearch.isStarred === true}
          title={$t`Show only flagged messages`} aria-label={$t`Show only flagged messages`}
          on:click={() => MailFilters.toggle(QuickFilter.Flagged)}>
          <FlagIcon size={16} />
        </button>
        <button class="pivot icon-pivot" class:active={$quickSearch.hasAttachment === true} aria-pressed={$quickSearch.hasAttachment === true}
          title={$t`Show only messages with attachments`} aria-label={$t`Show only messages with attachments`}
          on:click={() => MailFilters.toggle(QuickFilter.Attachments)}>
          <AttachmentIcon size={16} />
        </button>
        <button class="pivot icon-pivot" class:active={isFolderSearchOpen} aria-pressed={isFolderSearchOpen}
          title={$t`Search only the currently displayed folder for a keyword`} aria-label={$t`Search only this folder`}
          on:click={toggleFolderSearch}>
          <SearchIcon size={16} />
        </button>
      </hbox>
      {#if isFolderSearchOpen}
        <input type="search" class="folder-search"
          bind:value={quickSearch.bodyText}
          placeholder={$t`Search only this folder`}
          aria-label={$t`Search only this folder`}
          autocomplete="off"
          on:keydown={onFolderSearchKey}
          use:focusOnMount />
      {/if}
    {/if}
    {#if !isSimplified}
    {#if !showsFolderSearch}
      <hbox flex />
    {/if}
    <button class="arrange" bind:this={arrangeEl} on:click|stopPropagation={() => isArrangeMenuOpen = !isArrangeMenuOpen}
      title={$t`Arrange By`} aria-haspopup="menu">
      {arrangeLabel}
      <ChevronIcon size={14} />
    </button>
    {/if}
  </hbox>
  {#if columns}
    <ColumnHeader {folder} settings={$settings} {columns} showsRecipients={showsRecipients}
      onResizing={(column, width) => onResizing(column, width)} />
  {/if}
  {#if $listMessages.hasItems}
    <MessageList bind:this={messageList} bind:listEl
      {groups} showGroupHeaders={$settings.showInGroups}
      viewType={shownType}
      {columns}
      {previewIndent}
      previewLines={$settings.previewLines}
      tighterSpacing={$settings.tighterSpacing}
      sendersAboveSubject={$settings.showSendersAboveSubject || !$settings.showAsConversations}
      alwaysExpandSelected={$settings.showAsConversations && $settings.alwaysExpandSelected}
      classicIndented={$settings.classicIndented}
      {showFolder}
      {highlight}
      {selection}
      bind:selectedMessage />
    {#if onMoreResults}
      <hbox class="more-results">
        <span>{$t`Showing recent results…`}</span>
        <button type="button" class="more-link" on:click={() => catchErrors(onMoreResults)}>{$t`More`}</button>
      </hbox>
    {/if}
  {:else}
    <vbox flex class="empty">
      {#if isLoading}
        {$t`Loading…`}
      {:else}
        {$t`We didn't find anything to show here.`}
      {/if}
    </vbox>
  {/if}
</vbox>
<Menu bind:isMenuOpen={isArrangeMenuOpen} anchor={arrangeEl} placement="bottom-end">
  {#if !isSearchResult}
    <MenuLabel label={$t`Filter`} />
    <MenuItem label={$t`All Mail`} checked={!hasFilter} onClick={() => MailFilters.clear()} />
    <MenuItem label={$t`Unread Mail`} checked={$quickSearch.isRead === false}
      onClick={() => MailFilters.toggle(QuickFilter.Unread)} />
    <MenuItem label={$t`Flagged Mail`} checked={$quickSearch.isStarred}
      onClick={() => MailFilters.toggle(QuickFilter.Flagged)} />
    <MenuItem label={$t`Mail with Attachments`} checked={$quickSearch.hasAttachment}
      onClick={() => MailFilters.toggle(QuickFilter.Attachments)} />
    <MenuDivider />
  {/if}
  <ArrangeByMenuItems {folder} withLabel withSortOrder />
</Menu>
<Menu bind:isMenuOpen={isFilterMenuOpen} anchor={filterEl} placement="bottom-end">
  <MenuItem label={$t`All`} icon={AllIcon} checkable checked={!hasFilter} onClick={() => MailFilters.clear()} />
  <MenuItem label={$t`Unread`} icon={UnreadIcon} checkable checked={$quickSearch.isRead === false}
    onClick={() => MailFilters.toggle(QuickFilter.Unread)} />
  <MenuItem label={$t`Flagged`} icon={FlagIcon} checkable checked={$quickSearch.isStarred}
    onClick={() => MailFilters.toggle(QuickFilter.Flagged)} />
  <MenuItem label={$t`Has files`} icon={AttachmentIcon} checkable checked={$quickSearch.hasAttachment}
    onClick={() => MailFilters.toggle(QuickFilter.Attachments)} />
</Menu>
<Menu bind:isMenuOpen={isSortMenuOpen} anchor={sortEl} placement="bottom-end">
  <SortMenuItems {folder} />
</Menu>

<script lang="ts">
  import type { EMail } from "../../../logic/Mail/EMail";
  import type { Folder } from "../../../logic/Mail/Folder";
  import { EMailCollection } from "../../../logic/Mail/Store/EMailCollection";
  import { quickSearch } from "../../../frontend/Mail/Selected";
  import { MessageGrouping } from "./MessageGrouping";
  import { ListName } from "./ListName";
  import { ArrangeFields, Column, ColumnInfo, MailViewSettings, ViewType, type ViewSettings } from "../View/ViewSettings";
  import { MailFilters, QuickFilter } from "../MailFilters";
  import { catchErrors } from "../../../frontend/Util/error";
  import { CurrentTime } from "../../Calendar/View/CurrentTime";
  import MessageList from "./MessageList.svelte";
  import ColumnHeader from "./ColumnHeader.svelte";
  import ArrangeByMenuItems from "../View/ArrangeByMenuItems.svelte";
  import SortMenuItems from "../View/SortMenuItems.svelte";
  import Menu from "../../Shared/Menu/Menu.svelte";
  import MenuItem from "../../Shared/Menu/MenuItem.svelte";
  import MenuLabel from "../../Shared/Menu/MenuLabel.svelte";
  import MenuDivider from "../../Shared/Menu/MenuDivider.svelte";
  import ChevronIcon from "lucide-svelte/icons/chevron-down";
  import FilterIcon from "lucide-svelte/icons/list-filter";
  import SortIcon from "lucide-svelte/icons/arrow-down-wide-narrow";
  import AllIcon from "lucide-svelte/icons/mails";
  import UnreadIcon from "lucide-svelte/icons/mail";
  import FlagIcon from "lucide-svelte/icons/flag";
  import AttachmentIcon from "lucide-svelte/icons/paperclip";
  import SearchIcon from "lucide-svelte/icons/search";
  import type { RibbonLayout } from "../../Shared/Ribbon/Ribbon";
  import { getLocalStorage } from "../../../frontend/Util/LocalStorage";
  import { SpecialFolder } from "../../../logic/Mail/Folder";
  import type { ArrayColl, Collection } from "svelte-collections";
  import { gt, t } from "../../../l10n/l10n";

  export let folder: Folder | null;
  export let listMessages: Collection<EMail>;
  export let selection: ArrayColl<EMail>;
  export let selectedMessage: EMail | null;
  export let isSearchResult = false;
  export let showFolder = false;
  export let highlight: string | null = null;
  export let isLoading = false;
  export let onMoreResults: () => Promise<void> = null;
  export let listEl: HTMLDivElement = null;

  const currentMinute = CurrentTime.minute;

  let messageList: MessageList;
  let arrangeEl: HTMLButtonElement;
  let isArrangeMenuOpen = false;
  let filterEl: HTMLButtonElement;
  let isFilterMenuOpen = false;
  let sortEl: HTMLButtonElement;
  let isSortMenuOpen = false;
  const ribbonLayout = getLocalStorage<RibbonLayout>("lookout.ribbon.layout", "classic");

  $: isSimplified = $ribbonLayout.value == "simplified";
  $: listTitle = isSearchResult ? $t`Results` : $folder?.name ?? "";

  $: settings = MailViewSettings.store(folder);
  $: arrangeLabel = ArrangeFields.all().find(arrangement => arrangement.id == $settings.arrangeBy)?.button ?? gt`By Date`;
  $: showsRecipients = !!folder && [SpecialFolder.Sent, SpecialFolder.Drafts, SpecialFolder.Outbox].includes(folder.specialFolder);

  let paneWidth = 0;
  $: shownType = shownTypeAt($settings, paneWidth);
  function shownTypeAt(view: ViewSettings, width: number): ViewType {
    const kCharWidth = 7;
    return MailViewSettings.shownType(view, width, kCharWidth);
  }
  $: columns = shownType == ViewType.Compact ? null : visibleColumns($settings, showFolder);
  function visibleColumns(view: ViewSettings, withFolder: boolean): Column[] {
    let result = (view.columns?.length ? view.columns : MailViewSettings.defaultColumns())
      .filter(column => ColumnInfo.of(column));
    if (withFolder && !result.includes(Column.Folder)) {
      let subjectPos = result.indexOf(Column.Subject);
      result.splice(subjectPos >= 0 ? subjectPos + 1 : result.length, 0, Column.Folder);
    }
    return result;
  }

  let liveWidths: Partial<Record<Column, number>> = {};
  function onResizing(column: Column, width: number | null) {
    if (width == null) {
      delete liveWidths[column];
    } else {
      liveWidths[column] = width;
    }
    liveWidths = liveWidths;
  }
  $: gridTemplate = columns ? columns.map(column => columnWidth(column, $settings, liveWidths)).join(" ") : null;
  function columnWidth(column: Column, view: ViewSettings, live: Partial<Record<Column, number>>): string {
    if (ColumnInfo.of(column)?.isFlexible) {
      return "minmax(120px, 1fr)";
    }
    return (live[column] ?? MailViewSettings.widthOf(view, column)) + "px";
  }
  $: previewIndent = columns ? previewIndentOf(columns, $settings, liveWidths) : 0;
  function previewIndentOf(shown: Column[], view: ViewSettings, live: Partial<Record<Column, number>>): number {
    let indent = 0;
    for (let column of shown) {
      if (!ColumnInfo.of(column)?.isIcon) {
        break;
      }
      indent += live[column] ?? MailViewSettings.widthOf(view, column);
    }
    return indent + 4;
  }

  let grouping: MessageGrouping<EMail>;
  $: todayStart = new Date($currentMinute).setHours(0, 0, 0, 0);
  $: todayStart, grouping = new MessageGrouping<EMail>($settings.arrangeBy, !!$settings.reverseSort, !!$settings.showInGroups,
    message => ListName.of(message), new Date(), !!$settings.showAsConversations,
    $settings.groupBy ?? null, !!$settings.groupReverse);
  $: groups = grouping.arrange($listMessages.contents, listMessages instanceof EMailCollection);

  $: hasFilter = $quickSearch && quickSearch.hasSearch();
  $: isUnreadOnly = $quickSearch.isRead === false;
  function setUnreadOnly(unreadOnly: boolean) {
    quickSearch.isRead = unreadOnly ? false : null;
  }

  let isFolderSearchOpen = !!quickSearch.bodyText;
  $: showsFolderSearch = isFolderSearchOpen && !isSimplified && !isSearchResult;
  function toggleFolderSearch() {
    isFolderSearchOpen = !isFolderSearchOpen;
    if (!isFolderSearchOpen) {
      quickSearch.bodyText = null;
    }
  }
  function onFolderSearchKey(event: KeyboardEvent) {
    if (event.key == "Escape") {
      event.preventDefault();
      event.stopPropagation();
      toggleFolderSearch();
    }
  }
  function focusOnMount(input: HTMLInputElement) {
    input.focus();
  }

  export function scrollToTop() {
    messageList?.scrollToTop();
  }
  export function setAllGroupsCollapsed(collapsed: boolean) {
    messageList?.setAllGroupsCollapsed(collapsed);
  }
  export function selectRelative(offset: number) {
    messageList?.selectRelative(offset);
  }
  export function setGroupOfSelectionCollapsed(collapsed: boolean) {
    messageList?.setGroupOfSelectionCollapsed(collapsed);
  }
</script>

<style>
  .more-results {
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 6px 12px;
    border-top: 1px solid var(--lo-divider);
    color: var(--lo-fg-secondary);
    font-size: var(--lo-font-size-small);
  }
  .more-link {
    padding: 0;
    border: none;
    background: none;
    color: var(--lo-accent-text);
    font: inherit;
    text-decoration: underline;
    cursor: pointer;
  }
  .message-list-pane {
    min-width: 0;
    min-height: 0;
    overflow: hidden;
  }
  .list-header {
    flex-shrink: 0;
    align-items: center;
    gap: 4px;
    height: 44px;
    padding: 0 8px 0 12px;
    border-bottom: 1px solid var(--lo-divider);
  }
  .pivots {
    gap: 4px;
    align-self: stretch;
  }
  .pivot {
    position: relative;
    padding: 0 8px;
    border: none;
    background: none;
    color: var(--lo-fg);
    font: inherit;
    font-size: 15px;
    cursor: pointer;
  }
  .pivot:hover {
    color: var(--lo-accent-text);
  }
  .pivot.active {
    color: var(--lo-accent-text);
    font-weight: 600;
  }
  .quick-filters {
    gap: 0;
  }
  .icon-pivot {
    display: flex;
    align-items: center;
    padding: 0 6px;
    color: var(--lo-fg-secondary);
  }
  .pivot.icon-pivot.active::after {
    left: 4px;
    right: 4px;
  }
  .folder-search {
    flex: 1 1 0;
    min-width: 80px;
    margin-inline: 4px;
    height: 28px;
    padding: 0 8px;
    border: 1px solid var(--lo-input-border);
    border-radius: var(--lo-radius-small);
    background-color: var(--lo-input-bg);
    color: var(--lo-fg);
    font: inherit;
    font-size: 13px;
  }
  .folder-search:focus {
    outline: none;
    border-color: var(--lo-accent);
  }
  .pivot.active::after {
    content: "";
    position: absolute;
    left: 8px;
    right: 8px;
    bottom: 6px;
    height: 2px;
    border-radius: 1px;
    background-color: var(--lo-accent);
  }
  .list-title {
    overflow: hidden;
    font-size: 16px;
    font-weight: 600;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .header-button {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    gap: 6px;
    height: 28px;
    padding: 0 8px;
    border: none;
    border-radius: var(--lo-radius-small);
    background: none;
    color: var(--lo-fg);
    font: inherit;
    font-size: 13px;
    cursor: pointer;
  }
  .header-button:hover {
    background-color: var(--lo-hover-bg);
  }
  .header-button.active {
    background-color: var(--lo-selected-bg);
    color: var(--lo-accent-text);
  }
  .results-title {
    font-size: 15px;
    font-weight: 600;
  }
  .arrange {
    display: flex;
    align-items: center;
    gap: 4px;
    height: 28px;
    padding: 0 8px;
    border: none;
    border-radius: var(--lo-radius-small);
    background: none;
    color: var(--lo-fg);
    font: inherit;
    font-size: 13px;
    cursor: pointer;
  }
  .arrange:hover {
    background-color: var(--lo-hover-bg);
  }
  .empty {
    align-items: center;
    padding: 32px 16px;
    color: var(--lo-fg-secondary);
    text-align: center;
  }
</style>
