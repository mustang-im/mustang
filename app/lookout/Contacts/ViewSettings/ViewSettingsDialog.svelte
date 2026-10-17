<Dialog title={view == ContactView.Phone ? $t`Advanced View Settings: Phone` : $t`Advanced View Settings: List`}
  okLabel={$t`OK`} onOK={() => draft.save()} width="600px" on:close>
  <GroupBox label={$t`Description`}>
    <div class="rows">
      <DialogButton label={$t`Columns…`} classes="settings-button" onClick={() => { open = "columns"; }} />
      <span class="summary" title={draft.columnsSummary}>{draft.columnsSummary}</span>
      <DialogButton label={$t`Group By…`} classes="settings-button" onClick={() => { open = "group-by"; }} />
      <span class="summary">{draft.groupBySummary}</span>
      <DialogButton label={$t`Sort…`} classes="settings-button" onClick={() => { open = "sort"; }} />
      <span class="summary">{draft.sortSummary}</span>
    </div>
  </GroupBox>
  <svelte:fragment slot="buttons-start">
    <DialogButton label={$t`Reset Current View`} onClick={() => { draft = ContactViewDraft.defaults(view); }} />
  </svelte:fragment>
</Dialog>
{#if open == "columns"}
  <ShowColumnsDialog columns={draft.columns} allColumns={ContactColumns.allColumns} labelOf={ContactColumns.label}
    requiredColumn={ContactColumn.FullName} requiredReason={$t`The list needs the Full Name column`}
    columnSets={ContactColumns.columnSets()}
    onOK={columns => { draft.columns = columns; draft = draft; }} on:close={closeSub} />
{:else if open == "group-by"}
  <SortDialog title={$t`Group By`} itemsLabel={$t`Group items by`}
    columnOptions={[ { value: kNoGrouping, label: $t`(none)` }, ...sortOptions ]}
    column={draft.groupBy?.column ?? kNoGrouping} ascending={draft.groupBy?.ascending ?? true}
    onOK={(column, ascending) => { draft.groupBy = column == kNoGrouping ? null : { column: column as ContactColumn, ascending }; draft = draft; }}
    on:close={closeSub} />
{:else if open == "sort"}
  <SortDialog columnOptions={sortOptions} column={draft.sort.column} ascending={draft.sort.ascending}
    onOK={(column, ascending) => { draft.sort = { column, ascending }; draft = draft; }} on:close={closeSub} />
{/if}

<script lang="ts">
  import { ContactColumn, ContactColumns, ContactView } from "../Person/ContactColumns";
  import { ContactViewDraft } from "../Views/ContactViewDraft";
  import Dialog from "../../Shared/Dialog/Dialog.svelte";
  import DialogButton from "../../Shared/Dialog/DialogButton.svelte";
  import GroupBox from "../../Shared/Form/GroupBox.svelte";
  import ShowColumnsDialog from "../../Shared/ViewSettings/ShowColumnsDialog.svelte";
  import SortDialog from "../../Shared/ViewSettings/SortDialog.svelte";
  import { t } from "../../../l10n/l10n";

  export let view: ContactView;

  let draft = ContactViewDraft.fromSettings(view);
  let open: "columns" | "group-by" | "sort" | null = null;
  const kNoGrouping = "none";
  $: sortOptions = ContactColumns.columnSets().at(-1).columns
    .map(column => ({ value: column, label: ContactColumns.label(column) }));

  function closeSub() {
    open = null;
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
