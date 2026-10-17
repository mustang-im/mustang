<Dialog title={view == ContactView.Phone ? $t`Advanced View Settings: Phone` : $t`Advanced View Settings: List`}
  okLabel={$t`OK`} onOK={save} width="600px" on:close>
  <GroupBox label={$t`Description`}>
    <div class="rows">
      <DialogButton label={$t`Columns…`} classes="settings-button" onClick={() => { open = "columns"; }} />
      <span class="summary" title={columnsSummary}>{columnsSummary}</span>
      <DialogButton label={$t`Group By…`} classes="settings-button" onClick={() => { open = "group-by"; }} />
      <span class="summary">{groupBySummary}</span>
      <DialogButton label={$t`Sort…`} classes="settings-button" onClick={() => { open = "sort"; }} />
      <span class="summary">{sortSummary}</span>
    </div>
  </GroupBox>
  <svelte:fragment slot="buttons-start">
    <DialogButton label={$t`Reset Current View`} onClick={reset} />
  </svelte:fragment>
</Dialog>
{#if open == "columns"}
  <ShowColumnsDialog {columns} allColumns={ContactColumns.allColumns} labelOf={ContactColumns.label}
    requiredColumn={ContactColumn.FullName} requiredReason={$t`The list needs the Full Name column`}
    columnSets={ContactColumns.columnSets()}
    onOK={chosen => columns = ContactColumns.shownColumns(chosen)} on:close={closeSub} />
{:else if open == "group-by"}
  <SortDialog title={$t`Group By`} itemsLabel={$t`Group items by`}
    columnOptions={[ { value: kNoGrouping, label: $t`(none)` }, ...sortOptions ]}
    column={groupBy?.column ?? kNoGrouping} ascending={groupBy?.ascending ?? true}
    onOK={(column, ascending) => { groupBy = column == kNoGrouping ? null : { column: column as ContactColumn, ascending }; }}
    on:close={closeSub} />
{:else if open == "sort"}
  <SortDialog columnOptions={sortOptions} column={sort.column} ascending={sort.ascending}
    onOK={(column, ascending) => { sort = { column, ascending }; }} on:close={closeSub} />
{/if}

<script lang="ts">
  import { ContactColumn, ContactColumns, ContactView, type ContactSort } from "../Person/ContactColumns";
  import { getLocalStorage } from "../../../frontend/Util/LocalStorage";
  import Dialog from "../../Shared/Dialog/Dialog.svelte";
  import DialogButton from "../../Shared/Dialog/DialogButton.svelte";
  import GroupBox from "../../Shared/Form/GroupBox.svelte";
  import ShowColumnsDialog from "../../Shared/ViewSettings/ShowColumnsDialog.svelte";
  import SortDialog from "../../Shared/ViewSettings/SortDialog.svelte";
  import { t } from "../../../l10n/l10n";

  export let view: ContactView;

  const columnsSetting = getLocalStorage<ContactColumn[]>(view == ContactView.Phone ? "lookout.contacts.phone.columns" : "lookout.contacts.list.columns", ContactColumns.defaultColumns(view));
  const sortSetting = getLocalStorage<ContactSort>("lookout.contacts.sort", { column: ContactColumn.FullName, ascending: true });
  const groupBySetting = getLocalStorage<ContactSort | null>(view == ContactView.Phone ? "lookout.contacts.phone.groupBy" : "lookout.contacts.list.groupBy", ContactColumns.defaultGroupBy(view));
  let columns = ContactColumns.shownColumns(columnsSetting.value);
  let sort = { ...sortSetting.value };
  let groupBy = groupBySetting.value ? { ...groupBySetting.value } : null;
  let open: "columns" | "group-by" | "sort" | null = null;
  const kNoGrouping = "none";
  $: sortOptions = ContactColumns.columnSets().at(-1).columns
    .map(column => ({ value: column, label: ContactColumns.label(column) }));

  $: columnsSummary = columns.map(column => ContactColumns.label(column)).join(", ");
  $: sortLabel = ContactColumns.label(sort.column);
  $: sortSummary = sort.ascending ? $t`${sortLabel} (ascending)` : $t`${sortLabel} (descending)`;
  $: groupByLabel = groupBy ? ContactColumns.label(groupBy.column) : null;
  $: groupBySummary = !groupBy ? $t`None`
    : groupBy.ascending ? $t`${groupByLabel} (ascending)` : $t`${groupByLabel} (descending)`;

  function closeSub() {
    open = null;
  }

  function reset() {
    columns = ContactColumns.shownColumns(ContactColumns.defaultColumns(view));
    sort = { ...sortSetting.defaultValue };
    groupBy = ContactColumns.defaultGroupBy(view);
  }

  function save() {
    columnsSetting.value = ContactColumns.shownColumns(columns);
    sortSetting.value = { ...sort };
    groupBySetting.value = groupBy ? { ...groupBy } : null;
  }
</script>

<style>
  .rows {
    display: grid;
    grid-template-columns: 168px minmax(0, 1fr);
    align-items: center;
    gap: 8px 12px;
  }
  .rows :global(.settings-button) {
    justify-content: start;
    width: 100%;
  }
  .summary {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 13px;
  }
</style>
