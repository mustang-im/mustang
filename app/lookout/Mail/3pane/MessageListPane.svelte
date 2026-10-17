<vbox flex class="message-list-pane lo-card" style:--message-columns={gridTemplate} bind:clientWidth={paneWidth}>
  <FolderHeader {folder} {isSearchResult} />
  {#if columns}
    <ColumnHeader {folder} settings={$settings} {columns} showsRecipients={showsRecipients}
      onResizing={(column, width) => onResizing(column, width)} />
  {/if}
  {#if $listMessages.hasItems}
    <TableMessageList bind:this={messageList} bind:listEl
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
<script lang="ts">
  import type { EMail } from "../../../logic/Mail/EMail";
  import type { Folder } from "../../../logic/Mail/Folder";
  import { EMailCollection } from "../../../logic/Mail/Store/EMailCollection";
  import { MessageGrouping } from "./MessageGrouping";
  import { personDisplayName } from "../../../logic/Abstract/PersonUID";
  import { Column, ColumnInfo, MailViewSettings, ViewType, type ViewSettings } from "../ViewSettings/ViewSettings";
  import { catchErrors } from "../../../frontend/Util/error";
  import { now } from "../../Calendar/selected";
  import TableMessageList from "./TableMessageList.svelte";
  import ColumnHeader from "./ColumnHeader.svelte";
  import FolderHeader from "../LeftPane/FolderHeader.svelte";
  import { SpecialFolder } from "../../../logic/Mail/Folder";
  import type { ArrayColl, Collection } from "svelte-collections";
  import { derived } from "svelte/store";
  import { t } from "../../../l10n/l10n";

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


  let messageList: TableMessageList;


  $: settings = MailViewSettings.store(folder);
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

  /* <copied from="TableMessageListItem.svelte"> */
  function listName(message: EMail): string {
    let showsRecipient = [SpecialFolder.Sent, SpecialFolder.Drafts, SpecialFolder.Outbox].includes(message.folder?.specialFolder);
    return personDisplayName(showsRecipient ? message.contact : message.from) || message.from?.emailAddress || "";
  }
  /* </copied> */

  let grouping: MessageGrouping<EMail>;
  $: todayStart = new Date($now).setHours(0, 0, 0, 0);
  $: todayStart, grouping = new MessageGrouping<EMail>($settings.arrangeBy, !!$settings.reverseSort, !!$settings.showInGroups,
    listName, new Date(), !!$settings.showAsConversations,
    $settings.groupBy ?? null, !!$settings.groupReverse);
  $: arrangedMessages = grouping.changesWithMessages
    ? derived($listMessages.contents, () => listMessages.contents)
    : derived(listMessages, messages => messages.contents);
  $: groups = grouping.arrange($arrangedMessages, listMessages instanceof EMailCollection);

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
  .empty {
    align-items: center;
    padding: 32px 16px;
    color: var(--lo-fg-secondary);
    text-align: center;
  }
</style>
