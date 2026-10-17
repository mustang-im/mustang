<vbox flex class="contact-table" on:keydown={onKeyDown} bind:this={tableEl}>
  <div class="column-headers" style:grid-template-columns={gridColumns} style:padding-inline-end="{scrollbarWidth}px">
    {#each columns as column (column)}
      <button class="column-header" class:sorted={$sort.value.column == column}
        class:name={column == ContactColumn.FullName}
        class:drop-before={dropTarget?.column == column && dropTarget.before}
        class:drop-after={dropTarget?.column == column && !dropTarget.before}
        title={$t`Sort by ${ContactColumns.label(column)}`}
        aria-sort={$sort.value.column == column ? ($sort.value.ascending ? "ascending" : "descending") : "none"}
        draggable="true"
        on:dragstart={event => onDragStart(event, column)}
        on:dragover={event => onDragOver(event, column)}
        on:dragleave={() => { dropTarget = null; }}
        on:drop={event => onDrop(event, column)}
        on:dragend={() => { draggedColumn = null; dropTarget = null; }}
        on:click={() => sortBy(column)}
        on:contextmenu={event => onHeaderContextMenu(event, column)}>
        <span class="label">{ContactColumns.label(column)}</span>
        {#if $sort.value.column == column}
          <svelte:component this={$sort.value.ascending ? AscendingIcon : DescendingIcon} size="12" />
        {/if}
      </button>
    {/each}
  </div>
  {#if canAdd}
    <button class="add-row" style:grid-template-columns={gridColumns}
      on:click={() => ContactActions.newContact($selectedAddressbook)}>
      <span class="add-label">{$t`Click here to add a new Contact`}</span>
    </button>
  {/if}
  {#if $contacts.hasItems && grouping}
    <FastList
      items={rowItems}
      bind:selectedItem={selectedRow}
      bind:selectedItems={selectedRows}
      on:init={onInit}
      columns={gridColumns}>
      <svelte:fragment slot="row" let:item>
        {#if ContactGrouping.isHeader(item)}
          <ContactGroupRow group={item} onToggle={toggleGroup} />
        {:else}
          <PersonsTableRow contact={item} {columns} {onContextMenu} />
        {/if}
      </svelte:fragment>
    </FastList>
  {:else if $contacts.hasItems}
    <FastList
      items={contacts}
      bind:selectedItem={selectedContact}
      bind:selectedItems={selectedContacts}
      on:init={onInit}
      columns={gridColumns}>
      <PersonsTableRow slot="row" let:item contact={item} {columns} {onContextMenu} />
    </FastList>
  {:else}
    <vbox flex class="empty">{emptyText}</vbox>
  {/if}
</vbox>

<PersonMenu bind:this={contextMenu} />
<ContextMenu bind:this={headerMenu}>
  {#if headerColumn}
    <MenuItem label={$t`Sort Ascending`} icon={SortAscendingIcon}
      checked={$sort.value.column == headerColumn && $sort.value.ascending}
      onClick={() => { $sort.value = { column: headerColumn, ascending: true }; }} />
    <MenuItem label={$t`Sort Descending`} icon={SortDescendingIcon}
      checked={$sort.value.column == headerColumn && !$sort.value.ascending}
      onClick={() => { $sort.value = { column: headerColumn, ascending: false }; }} />
    <MenuDivider />
  {/if}
  <SubMenu label={$t`Arrange By`} icon={ArrangeIcon}>
    {#each columns as column}
      <MenuItem label={ContactColumns.label(column)} checked={$sort.value.column == column}
        onClick={() => { $sort.value = { column, ascending: true }; }} />
    {/each}
  </SubMenu>
  <MenuItem label={$t`Reverse Sort`} icon={ReverseIcon}
    onClick={() => { $sort.value = { column: $sort.value.column, ascending: !$sort.value.ascending }; }} />
  <MenuDivider />
  {#if headerColumn}
    <MenuItem label={$t`Group By This Field`} icon={GroupIcon}
      checked={$groupBySetting.value?.column == headerColumn}
      onClick={() => groupBy(headerColumn)} />
  {/if}
  {#if grouping}
    <MenuItem label={$t`Expand All Groups`} icon={ExpandAllIcon} onClick={() => setAllCollapsed(false)} />
    <MenuItem label={$t`Collapse All Groups`} icon={CollapseAllIcon} onClick={() => setAllCollapsed(true)} />
  {/if}
  <MenuDivider />
  {#if headerColumn}
    <MenuItem label={$t`Remove This Column`} icon={RemoveIcon}
      disabled={headerColumn == ContactColumn.FullName && $t`The list needs the Full Name column`}
      onClick={() => ContactColumns.removeColumn(view, headerColumn)} />
  {/if}
  <MenuItem label={$t`Add Columns…`} icon={AddColumnsIcon} onClick={() => ContactDialogs.open({ kind: "show-columns", view })} />
  <MenuDivider />
  <MenuItem label={$t`View Settings…`} icon={ViewSettingsIcon} onClick={() => ContactDialogs.open({ kind: "view-settings", view })} />
</ContextMenu>

<script lang="ts">
  import type { Contact } from "../../../logic/Abstract/Contact";
  import { ContactActions } from "../ContactActions";
  import PersonsTableRow from "./PersonsTableRow.svelte";
  import ContactGroupRow from "./ContactGroupRow.svelte";
  import { ContactGrouping, type ContactGroupHeader, type ContactRow } from "../Views/ContactGrouping";
  import { ObservedItems } from "../../Shared/ObservedItems";
  import GroupIcon from "lucide-svelte/icons/group";
  import ExpandAllIcon from "lucide-svelte/icons/chevrons-up-down";
  import CollapseAllIcon from "lucide-svelte/icons/chevrons-down-up";
  import PersonMenu from "../PersonPage/PersonMenu.svelte";
  import { selectedAddressbook } from "./Selected";
  import { appGlobal } from "../../../logic/app";
  import ContextMenu from "../../Shared/Menu/ContextMenu.svelte";
  import MenuItem from "../../Shared/Menu/MenuItem.svelte";
  import MenuDivider from "../../Shared/Menu/MenuDivider.svelte";
  import SubMenu from "../../Shared/Menu/SubMenu.svelte";
  import SortAscendingIcon from "lucide-svelte/icons/arrow-up-a-z";
  import SortDescendingIcon from "lucide-svelte/icons/arrow-down-z-a";
  import ArrangeIcon from "lucide-svelte/icons/arrow-down-wide-narrow";
  import ReverseIcon from "lucide-svelte/icons/arrow-up-down";
  import FastList from "../../../frontend/Shared/FastList.svelte";
  import { ContactColumn, ContactColumns, type ContactView } from "./ContactColumns";
  import { ContactDialogs } from "../Dialogs/ContactDialogs";
  import RemoveIcon from "lucide-svelte/icons/x";
  import AddColumnsIcon from "lucide-svelte/icons/columns-3";
  import ViewSettingsIcon from "lucide-svelte/icons/sliders-horizontal";
  import AscendingIcon from "lucide-svelte/icons/chevron-up";
  import DescendingIcon from "lucide-svelte/icons/chevron-down";
  import { ArrayColl, type Collection } from "svelte-collections";
  import { t } from "../../../l10n/l10n";

  export let contacts: Collection<Contact>;
  export let selectedContact: Contact;
  export let selectedContacts: ArrayColl<Contact>;
  export let emptyText: string;
  export let columns: ContactColumn[];
  export let view: ContactView;

  const sort = ContactColumns.sort;
  $: gridColumns = columns.map(column => ContactColumns.width(column)).join(" ");

  $: groupBySetting = ContactColumns.groupBySetting(view);
  $: grouping = $groupBySetting.value ? new ContactGrouping($groupBySetting.value) : null;
  $: listedContacts = ObservedItems.of(contacts);
  let collapsed = new Set<string>();
  const rowItems = new ArrayColl<ContactRow>();
  $: rowItems.replaceAll(grouping ? grouping.rows($listedContacts, collapsed) : []);
  let selectedRows = new ArrayColl<ContactRow>();
  let selectedRow: ContactRow = null;
  $: grouping && selectionToOutside($selectedRows);
  $: grouping && selectionFromOutside($selectedContacts);

  function selectionToOutside(rows: ArrayColl<ContactRow>) {
    let selected = rows.contents.filter(row => !ContactGrouping.isHeader(row)) as Contact[];
    if (!sameItems(selected, selectedContacts.contents)) {
      selectedContacts.replaceAll(selected);
    }
    selectedContact = selected[0] ?? null;
  }

  function selectionFromOutside(outside: ArrayColl<Contact>) {
    let inside = selectedRows.contents.filter(row => !ContactGrouping.isHeader(row));
    if (!sameItems(inside, outside.contents)) {
      selectedRows.replaceAll(outside.contents);
    }
  }

  function sameItems(first: ContactRow[], second: ContactRow[]): boolean {
    return first.length == second.length && first.every((item, i) => item == second[i]);
  }

  function toggleGroup(group: ContactGroupHeader) {
    setCollapsed(group, !group.isCollapsed);
  }

  function setCollapsed(group: ContactGroupHeader, isCollapsed: boolean) {
    if (isCollapsed) {
      collapsed.add(group.id);
    } else {
      collapsed.delete(group.id);
    }
    collapsed = collapsed;
  }

  function setAllCollapsed(isCollapsed: boolean) {
    collapsed = new Set(isCollapsed ? grouping.groups($listedContacts).map(group => group.id) : []);
  }

  function groupBy(column: ContactColumn) {
    $groupBySetting.value = $groupBySetting.value?.column == column ? null : { column, ascending: true };
  }

  function sortBy(column: ContactColumn) {
    ContactColumns.sort.value = ContactColumns.toggledSort(ContactColumns.sort.value, column);
  }

  let draggedColumn: ContactColumn = null;
  let dropTarget: { column: ContactColumn, before: boolean } | null = null;

  function onDragStart(event: DragEvent, column: ContactColumn) {
    draggedColumn = column;
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", ContactColumns.label(column));
  }

  function onDragOver(event: DragEvent, column: ContactColumn) {
    if (!draggedColumn) {
      return;
    }
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    let box = (event.currentTarget as HTMLElement).getBoundingClientRect();
    let before = event.clientX < box.left + box.width / 2;
    dropTarget = column == draggedColumn ? null : { column, before };
  }

  function onDrop(event: DragEvent, column: ContactColumn) {
    event.preventDefault();
    if (draggedColumn && dropTarget) {
      let pos = columns.indexOf(column);
      let before = dropTarget.before ? column : columns[pos + 1] ?? null;
      ContactColumns.moveColumn(view, draggedColumn, before);
    }
    draggedColumn = null;
    dropTarget = null;
  }

  let contextMenu: PersonMenu;
  let headerMenu: ContextMenu;
  let headerColumn: ContactColumn = null;

  $: canAdd = !$selectedAddressbook || appGlobal.addressbooks.contains($selectedAddressbook);

  function onHeaderContextMenu(event: MouseEvent, column: ContactColumn) {
    event.preventDefault();
    headerColumn = column;
    headerMenu.onContextMenu(event);
  }
  let tableEl: HTMLElement;
  let scrollbarWidth = 0;

  function onInit(event: CustomEvent<{ scrollToItem: (row: ContactRow) => void }>) {
    if (!contacts.contains(selectedContact)) {
      selectedContacts.clear();
      selectedContacts.add(contacts.first);
    }
    event.detail.scrollToItem(selectedContacts.first ?? selectedContact);
    let listEl = tableEl.querySelector(".fast-list") as HTMLElement;
    scrollbarWidth = listEl ? listEl.offsetWidth - listEl.clientWidth : 0;
  }

  function onContextMenu(event: MouseEvent, contact: Contact) {
    contextMenu.openFor(event, contact, selectedContacts);
  }

  function onKeyDown(event: KeyboardEvent) {
    if (grouping && ContactGrouping.isHeader(selectedRow) && !event.ctrlKey && !event.altKey &&
        (event.key == "ArrowLeft" || event.key == "ArrowRight" || event.key == "Enter")) {
      event.preventDefault();
      let group = selectedRow;
      setCollapsed(group, event.key == "Enter" ? !group.isCollapsed : event.key == "ArrowLeft");
      return;
    }
    if (event.key == "Enter" && selectedContact && !event.ctrlKey && !event.altKey) {
      event.preventDefault();
      ContactActions.edit(selectedContact);
    }
  }
</script>

<style>
  .contact-table {
    min-height: 0;
  }
  .column-headers {
    display: grid;
    flex-shrink: 0;
    border-block-end: 1px solid var(--lo-divider);
  }
  .column-header {
    display: flex;
    align-items: center;
    gap: 4px;
    min-width: 0;
    height: 32px;
    padding: 0 12px;
    border: none;
    border-inline-end: 1px solid var(--lo-divider);
    background: none;
    overflow: hidden;
    white-space: nowrap;
    font: inherit;
    font-size: var(--lo-font-size-small);
    font-weight: 600;
    color: var(--lo-fg-secondary);
    text-align: start;
    cursor: pointer;
  }
  .column-header:hover {
    background-color: var(--lo-hover-bg);
    color: var(--lo-fg);
  }
  .column-header.sorted {
    color: var(--lo-fg);
  }
  .column-header .label {
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .column-header.name {
    padding-inline-start: 44px;
  }
  .column-header.drop-before {
    box-shadow: inset 2px 0 0 var(--lo-accent);
  }
  .column-header.drop-after {
    box-shadow: inset -2px 0 0 var(--lo-accent);
  }
  .contact-table :global(.fast-list .header) {
    display: none;
  }
  .contact-table :global(.fast-list .row > *) {
    padding: 0;
  }
  .contact-table :global(.fast-list:focus-visible) {
    outline: none;
  }
  .contact-table :global(.fast-list:focus-visible .row.selected .cell) {
    border-block: 1px solid var(--lo-focus-ring);
  }
  .add-row {
    display: grid;
    flex-shrink: 0;
    height: 30px;
    padding: 0;
    border: none;
    border-block-end: 1px solid var(--lo-divider);
    background: none;
    font: inherit;
    text-align: start;
    cursor: text;
  }
  .add-row:hover {
    background-color: var(--lo-hover-bg);
  }
  .add-label {
    grid-column: 1 / -1;
    padding-inline-start: 44px;
    color: var(--lo-fg-secondary);
    font-style: italic;
  }
  .empty {
    align-items: center;
    padding: 32px 16px;
    color: var(--lo-fg-secondary);
  }
</style>
