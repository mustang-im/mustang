<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div class="message-list"
  role="listbox"
  aria-multiselectable="true"
  aria-label={$t`Messages`}
  tabindex="0"
  bind:this={listEl}
  bind:clientHeight={viewHeight}
  on:scroll={onScroll}
  on:keydown={onKeyDown}>
  <div class="canvas" style="height: {rows.totalHeight}px;">
    {#each visibleIndexes as index (keyOf(rows.rows[index]))}
      {@const row = rows.rows[index]}
      <div class="slot" style="top: {rows.topOf(index)}px; height: {rows.heightOf(index)}px;">
        {#if row.kind == "header"}
          <button class="group-header" tabindex="-1"
            on:click={() => toggleGroup(row.group.id)}
            aria-expanded={!row.isCollapsed}>
            <ChevronIcon size={14} class="chevron {row.isCollapsed ? 'collapsed' : ''}" />
            <span class="group-label">{row.group.label}</span>
            {#if row.isCollapsed}
              <span class="group-count">{row.group.messages.length}</span>
            {/if}
          </button>
        {:else}
          <MessageListItem message={row.message}
            isSelected={$selection.contains(row.message)}
            {previewLines}
            threadSize={row.thread?.length ?? 0}
            isThreadExpanded={row.isThreadExpanded}
            isThreadChild={row.isThreadChild}
            on:toggleThread={() => toggleThread(row.message)}
            on:click={event => onClickMessage(row.message, event)}
            on:dblclick={() => MessageActions.openDraft(row.message)}
            on:contextmenu={event => onContextMenu(row.message, event)} />
        {/if}
      </div>
    {/each}
  </div>
</div>
<ContextMenu bind:this={contextMenu}>
  <MessageContextMenu messages={contextMessages} />
</ContextMenu>

<script lang="ts">
  import type { EMail } from "../../../logic/Mail/EMail";
  import type { MessageGroup } from "./MessageGrouping";
  import { MessageRows, type MessageRow } from "./MessageRows";
  import { MessageMetadata } from "./MessageMetadata";
  import { MessageActions } from "../MessageActions";
  import MessageListItem from "./MessageListItem.svelte";
  import MessageContextMenu from "./MessageContextMenu.svelte";
  import ContextMenu from "../../../frontend/Shared/Menu/ContextMenu.svelte";
  import ChevronIcon from "lucide-svelte/icons/chevron-down";
  import type { ArrayColl } from "svelte-collections";
  import { catchErrors } from "../../../frontend/Util/error";
  import { tick } from "svelte";
  import { t } from "../../../l10n/l10n";

  export let groups: MessageGroup<EMail>[];
  export let showGroupHeaders = true;
  export let previewLines = 1;
  export let selection: ArrayColl<EMail>;
  export let selectedMessage: EMail | null;
  export let listEl: HTMLDivElement = null;

  const kHeaderHeight = 30;
  let collapsedGroups = new Set<string>();
  let expandedThreads = new Set<EMail>();
  let viewHeight = 400;
  let scrollTop = 0;

  $: messageHeight = 53 + 18 * previewLines;
  $: rows = new MessageRows(groups, collapsedGroups, showGroupHeaders, kHeaderHeight, messageHeight, expandedThreads);
  $: visibleIndexes = visibleRange(rows, scrollTop, viewHeight);
  $: MessageMetadata.load(visibleMessages(visibleIndexes));

  function visibleMessages(indexes: number[]): EMail[] {
    let messages: EMail[] = [];
    for (let index of indexes) {
      let row = rows.rows[index];
      if (row.kind == "message") {
        messages.push(row.message);
      }
    }
    return messages;
  }

  function visibleRange(rows: MessageRows<EMail>, top: number, height: number): number[] {
    const kOverscan = 6;
    if (!rows.length) {
      return [];
    }
    let start = Math.max(rows.indexAt(top) - kOverscan, 0);
    let end = Math.min(rows.indexAt(top + height) + kOverscan, rows.length - 1);
    let indexes: number[] = [];
    for (let i = start; i <= end; i++) {
      indexes.push(i);
    }
    return indexes;
  }

  function keyOf(row: MessageRow<EMail>): any {
    return row.kind == "header" ? "group:" + row.group.id : row.message;
  }

  function onScroll() {
    scrollTop = listEl.scrollTop;
  }

  export function scrollToTop() {
    if (listEl) {
      listEl.scrollTop = 0;
    }
    scrollTop = 0;
  }

  function scrollIntoView(message: EMail) {
    let index = rows.indexOfMessage(message);
    if (index < 0 || !listEl) {
      return;
    }
    let top = rows.topOf(index);
    let bottom = top + rows.heightOf(index);
    if (index > 0 && rows.rows[index - 1].kind == "header") {
      top -= kHeaderHeight;
    }
    if (top < listEl.scrollTop) {
      listEl.scrollTop = top;
    } else if (bottom > listEl.scrollTop + listEl.clientHeight) {
      listEl.scrollTop = bottom - listEl.clientHeight;
    }
    scrollTop = listEl.scrollTop;
  }

  function toggleGroup(id: string) {
    if (collapsedGroups.has(id)) {
      collapsedGroups.delete(id);
    } else {
      collapsedGroups.add(id);
    }
    collapsedGroups = collapsedGroups;
  }

  export function selectRelative(offset: number) {
    let messages = rows.messages;
    if (!messages.length) {
      return;
    }
    let pos = selectedMessage ? messages.indexOf(selectedMessage) : -1;
    let target = messages[Math.max(0, Math.min(pos + offset, messages.length - 1))];
    select([target], target);
    anchor = target;
    scrollIntoView(target);
  }

  function toggleThread(lead: EMail) {
    if (expandedThreads.has(lead)) {
      expandedThreads.delete(lead);
    } else {
      expandedThreads.add(lead);
    }
    expandedThreads = expandedThreads;
  }

  function threadLeadOf(message: EMail): EMail | null {
    let row = rows.rows[rows.indexOfMessage(message)];
    if (row?.kind != "message") {
      return null;
    }
    if (row.thread) {
      return message;
    }
    if (row.isThreadChild) {
      return [...row.group.threads?.entries() ?? []].find(([, thread]) => thread.includes(message))?.[0] ?? null;
    }
    return null;
  }

  function setThreadExpanded(message: EMail, expanded: boolean): boolean {
    let lead = threadLeadOf(message);
    if (!lead || expandedThreads.has(lead) == expanded) {
      return false;
    }
    toggleThread(lead);
    if (!expanded && message != lead) {
      select([lead], lead);
      anchor = lead;
    }
    return true;
  }

  export function setAllGroupsCollapsed(collapsed: boolean) {
    collapsedGroups = collapsed ? new Set(groups.map(group => group.id)) : new Set();
  }

  export function setGroupOfSelectionCollapsed(collapsed: boolean) {
    let group = groups.find(group => group.messages.includes(selectedMessage));
    if (!group || collapsedGroups.has(group.id) == collapsed) {
      return;
    }
    toggleGroup(group.id);
  }

  let anchor: EMail | null = null;

  function select(messages: EMail[], primary: EMail) {
    selection.clear();
    selection.addAll(messages);
    selectedMessage = primary;
  }

  function onClickMessage(message: EMail, event: MouseEvent) {
    listEl?.focus();
    if (event.shiftKey && anchor && rows.hasMessage(anchor)) {
      selectRange(anchor, message);
    } else if (event.ctrlKey || event.metaKey) {
      if (selection.contains(message)) {
        selection.remove(message);
        selectedMessage = selection.isEmpty ? null : selection.last;
      } else {
        selection.add(message);
        selectedMessage = message;
      }
      anchor = message;
    } else {
      select([message], message);
      anchor = message;
    }
  }

  function selectRange(from: EMail, to: EMail) {
    let fromPos = rows.messages.indexOf(from);
    let toPos = rows.messages.indexOf(to);
    let range = rows.messages.slice(Math.min(fromPos, toPos), Math.max(fromPos, toPos) + 1);
    select(range, to);
  }

  let contextMenu: ContextMenu;
  let contextMessages: EMail[] = [];
  function onContextMenu(message: EMail, event: MouseEvent) {
    event.preventDefault();
    if (!selection.contains(message)) {
      select([message], message);
      anchor = message;
    }
    contextMessages = selection.contents;
    contextMenu.onContextMenu(event);
  }

  function onKeyDown(event: KeyboardEvent) {
    let messages = rows.messages;
    if (!messages.length) {
      return;
    }
    let current = selectedMessage && rows.hasMessage(selectedMessage) ? selectedMessage : null;
    let pos = current ? messages.indexOf(current) : -1;
    let pageSize = Math.max(Math.floor(viewHeight / messageHeight) - 1, 1);
    let newPos: number = null;
    if (event.altKey) {
      return;
    }
    if (event.key == "ArrowDown") {
      newPos = pos + 1;
    } else if (event.key == "ArrowUp") {
      newPos = pos < 0 ? 0 : pos - 1;
    } else if (event.key == "PageDown") {
      newPos = pos + pageSize;
    } else if (event.key == "PageUp") {
      newPos = pos - pageSize;
    } else if (event.key == "Home") {
      newPos = 0;
    } else if (event.key == "End") {
      newPos = messages.length - 1;
    } else if ((event.ctrlKey || event.metaKey) && !event.shiftKey && event.key.toLowerCase() == "a") {
      event.preventDefault();
      event.stopPropagation();
      select(messages, current ?? messages[0]);
      return;
    } else if (event.key == "ArrowLeft" && !event.ctrlKey) {
      event.preventDefault();
      if (!(current && setThreadExpanded(current, false)) && showGroupHeaders) {
        setGroupOfSelectionCollapsed(true);
      }
      return;
    } else if (event.key == "ArrowRight" && !event.ctrlKey) {
      event.preventDefault();
      if (!(current && setThreadExpanded(current, true)) && showGroupHeaders) {
        setGroupOfSelectionCollapsed(false);
      }
      return;
    } else if (event.key == "Enter" && current) {
      event.preventDefault();
      MessageActions.openDraft(current);
      return;
    }
    if (newPos == null) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    newPos = Math.max(0, Math.min(newPos, messages.length - 1));
    let target = messages[newPos];
    if (event.shiftKey) {
      if (!anchor || !rows.hasMessage(anchor)) {
        anchor = current ?? target;
      }
      selectRange(anchor, target);
    } else if (event.ctrlKey || event.metaKey) {
      selectedMessage = target;
    } else {
      select([target], target);
      anchor = target;
    }
    scrollIntoView(target);
  }

  let lastPosition = 0;
  $: if (selectedMessage && rows.hasMessage(selectedMessage)) {
    lastPosition = rows.messages.indexOf(selectedMessage);
  }
  $: rows, $selection, ensureSelection();
  function ensureSelection() {
    let gone = selection.contents.filter(message => !rows.hasMessage(message));
    if (gone.length) {
      selection.removeAll(gone);
    }
    if (selection.hasItems) {
      if (!selection.contains(selectedMessage)) {
        selectedMessage = selection.last;
      }
      return;
    }
    if (!gone.length) {
      return;
    }
    let replacement = rows.messages[Math.min(lastPosition, rows.messages.length - 1)] ?? null;
    if (replacement) {
      select([replacement], replacement);
    } else {
      selectedMessage = null;
    }
  }

  let isInitialScrollDone = false;
  $: if (!isInitialScrollDone && listEl && rows.length) {
    isInitialScrollDone = true;
    catchErrors(scrollToSelectionOnMount);
  }
  async function scrollToSelectionOnMount() {
    await tick();
    if (selectedMessage) {
      scrollIntoView(selectedMessage);
    }
  }

  $: selectedMessage, followOutsideSelection();
  async function followOutsideSelection() {
    if (!selectedMessage || selection.contains(selectedMessage)) {
      return;
    }
    if (!rows.hasMessage(selectedMessage)) {
      return;
    }
    select([selectedMessage], selectedMessage);
    anchor = selectedMessage;
    await tick();
    scrollIntoView(selectedMessage);
  }
</script>

<style>
  .message-list {
    flex: 1 0 0;
    position: relative;
    min-height: 0;
    overflow-y: auto;
    overflow-x: hidden;
    outline: none;
  }
  .canvas {
    position: relative;
    width: 100%;
  }
  .slot {
    position: absolute;
    left: 0;
    right: 0;
  }
  .group-header {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 6px;
    width: 100%;
    height: 100%;
    padding: 0 12px;
    border: none;
    border-bottom: 1px solid var(--lo-divider);
    background-color: var(--lo-pane-alt-bg);
    color: var(--lo-fg);
    font: inherit;
    font-size: 13px;
    font-weight: 600;
    text-align: start;
    cursor: pointer;
  }
  .group-header:hover {
    background-color: var(--lo-hover-bg);
  }
  .group-header :global(.chevron) {
    flex-shrink: 0;
    color: var(--lo-fg-secondary);
    transition: transform 0.1s;
  }
  .group-header :global(.chevron.collapsed) {
    transform: rotate(-90deg);
  }
  .group-count {
    color: var(--lo-fg-secondary);
    font-weight: normal;
  }
</style>
