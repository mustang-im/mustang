<vbox flex class="message-list-pane lo-card">
  <hbox class="list-header">
    {#if isSearchResult}
      <span class="results-title">{$t`Search results`}</span>
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
    {/if}
    <hbox flex />
    <button class="arrange" bind:this={arrangeEl} on:click={() => isArrangeMenuOpen = !isArrangeMenuOpen}
      title={$t`Arrange By`} aria-haspopup="menu">
      {arrangeLabel}
      <ChevronIcon size={14} />
    </button>
    <button class="reverse" on:click={() => $reverseSort.value = !$reverseSort.value}
      title={$t`Reverse Sort`} aria-label={$t`Reverse Sort`}>
      {#if $reverseSort.value}
        <SortDownIcon size={16} />
      {:else}
        <SortUpIcon size={16} />
      {/if}
    </button>
  </hbox>
  {#if $listMessages.hasItems}
    <MessageList bind:this={messageList} bind:listEl
      {groups} showGroupHeaders={$showInGroups.value}
      previewLines={$previewLines.value}
      {showFolder}
      {highlight}
      {selection}
      bind:selectedMessage />
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
    <MenuItem label={$t`All`} icon={!hasFilter ? CheckIcon : BlankIcon} onClick={() => MailFilters.clear()} />
    <MenuItem label={$t`Unread`} icon={$quickSearch.isRead === false ? CheckIcon : BlankIcon}
      onClick={() => MailFilters.toggle(QuickFilter.Unread)} />
    <MenuItem label={$t`Flagged`} icon={$quickSearch.isStarred ? CheckIcon : BlankIcon}
      onClick={() => MailFilters.toggle(QuickFilter.Flagged)} />
    <MenuItem label={$t`Has Attachments`} icon={$quickSearch.hasAttachment ? CheckIcon : BlankIcon}
      onClick={() => MailFilters.toggle(QuickFilter.Attachments)} />
    <MenuDivider />
  {/if}
  <MenuLabel label={$t`Arrange By`} />
  {#each arrangements as arrangement}
    <MenuItem label={arrangement.label} icon={$arrangeBy.value == arrangement.id ? CheckIcon : BlankIcon}
      onClick={() => $arrangeBy.value = arrangement.id} />
  {/each}
  <MenuDivider />
  <MenuLabel label={$t`Sort Order`} />
  <MenuItem label={sortOrderLabels[0]} icon={!$reverseSort.value ? CheckIcon : BlankIcon}
    onClick={() => $reverseSort.value = false} />
  <MenuItem label={sortOrderLabels[1]} icon={$reverseSort.value ? CheckIcon : BlankIcon}
    onClick={() => $reverseSort.value = true} />
  <MenuDivider />
  <MenuItem label={$t`Show as Conversations`} icon={$showAsConversations.value ? CheckIcon : BlankIcon}
    onClick={() => $showAsConversations.value = !$showAsConversations.value} />
  <MenuItem label={$t`Show in Groups`} icon={$showInGroups.value ? CheckIcon : BlankIcon}
    onClick={() => $showInGroups.value = !$showInGroups.value} />
</Menu>

<script lang="ts">
  import type { EMail } from "../../../logic/Mail/EMail";
  import { EMailCollection } from "../../../logic/Mail/Store/EMailCollection";
  import { quickSearch } from "../../../frontend/Mail/Selected";
  import { ArrangeBy, MessageGrouping } from "./MessageGrouping";
  import { ListName } from "./ListName";
  import { MailView } from "../MailView";
  import { MailFilters, QuickFilter } from "../MailFilters";
  import MessageList from "./MessageList.svelte";
  import Menu from "../../../frontend/Shared/Menu/Menu.svelte";
  import MenuItem from "../../../frontend/Shared/Menu/MenuItem.svelte";
  import MenuLabel from "../../../frontend/Shared/Menu/MenuLabel.svelte";
  import MenuDivider from "../../../frontend/Shared/Menu/MenuDivider.svelte";
  import ChevronIcon from "lucide-svelte/icons/chevron-down";
  import SortUpIcon from "lucide-svelte/icons/arrow-up";
  import SortDownIcon from "lucide-svelte/icons/arrow-down";
  import CheckIcon from "lucide-svelte/icons/check";
  import BlankIcon from "../Menu/BlankIcon.svelte";
  import type { ArrayColl, Collection } from "svelte-collections";
  import { gt, t } from "../../../l10n/l10n";

  export let listMessages: Collection<EMail>;
  export let selection: ArrayColl<EMail>;
  export let selectedMessage: EMail | null;
  export let isSearchResult = false;
  export let showFolder = false;
  export let highlight: string | null = null;
  export let isLoading = false;
  export let listEl: HTMLDivElement = null;

  const arrangeBy = MailView.arrangeBy;
  const reverseSort = MailView.reverseSort;
  const showInGroups = MailView.showInGroups;
  const showAsConversations = MailView.showAsConversations;
  const previewLines = MailView.previewLines;

  let messageList: MessageList;
  let arrangeEl: HTMLButtonElement;
  let isArrangeMenuOpen = false;

  const arrangements = [
    { id: ArrangeBy.Date, label: gt`Date`, button: gt`By Date` },
    { id: ArrangeBy.From, label: gt`From`, button: gt`By From` },
    { id: ArrangeBy.Subject, label: gt`Subject`, button: gt`By Subject` },
    { id: ArrangeBy.Size, label: gt`Size`, button: gt`By Size` },
    { id: ArrangeBy.Importance, label: gt`Importance`, button: gt`By Importance` },
    { id: ArrangeBy.Flag, label: gt`Flag Status`, button: gt`By Flag Status` },
  ];
  $: arrangeLabel = arrangements.find(arrangement => arrangement.id == $arrangeBy.value)?.button ?? gt`By Date`;
  $: sortOrderLabels = MessageGrouping.sortOrderLabels($arrangeBy.value);

  $: grouping = new MessageGrouping<EMail>($arrangeBy.value, !!$reverseSort.value, !!$showInGroups.value,
    message => ListName.of(message), new Date(), !!$showAsConversations.value);
  $: groups = grouping.arrange($listMessages.contents, listMessages instanceof EMailCollection);

  $: hasFilter = $quickSearch && quickSearch.hasSearch();
  $: isUnreadOnly = $quickSearch.isRead === false;
  function setUnreadOnly(unreadOnly: boolean) {
    quickSearch.isRead = unreadOnly ? false : null;
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
  .results-title {
    font-size: 15px;
    font-weight: 600;
  }
  .arrange,
  .reverse {
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
  .reverse {
    padding: 0 6px;
  }
  .arrange:hover,
  .reverse:hover {
    background-color: var(--lo-hover-bg);
  }
  .empty {
    align-items: center;
    padding: 32px 16px;
    color: var(--lo-fg-secondary);
    text-align: center;
  }
</style>
