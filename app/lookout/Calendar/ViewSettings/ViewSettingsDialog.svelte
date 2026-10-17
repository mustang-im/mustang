<Dialog title={isTable ? $t`Advanced View Settings: List` : $t`Advanced View Settings: Calendar`}
  okLabel={$t`OK`} onOK={save} width="600px" on:close>
  <GroupBox label={$t`Description`}>
    <div class="rows">
      <DialogButton label={$t`Columns…`} classes="settings-button" onClick={() => { open = "columns"; }}
        disabled={!isTable && tableOnly} />
      <span class="summary" class:disabled={!isTable} title={draft.columnsSummary}>{draft.columnsSummary}</span>
      <DialogButton label={$t`Group By…`} classes="settings-button" onClick={() => { open = "group-by"; }}
        disabled={!isTable && tableOnly} />
      <span class="summary" class:disabled={!isTable}>{draft.groupSummary}</span>
      <DialogButton label={$t`Sort…`} classes="settings-button" onClick={() => { open = "sort"; }}
        disabled={!isTable && tableOnly} />
      <span class="summary" class:disabled={!isTable}>{draft.sortSummary}</span>
      <DialogButton label={$t`Other Settings…`} classes="settings-button" onClick={() => { open = "other"; }} />
      <span class="summary">{$t`Time scale, week numbers and declined meetings`}</span>
    </div>
  </GroupBox>
  <svelte:fragment slot="buttons-start">
    <DialogButton label={$t`Reset Current View`} onClick={reset} />
  </svelte:fragment>
</Dialog>
{#if open == "columns"}
  <ShowColumnsDialog columns={draft.columns} allColumns={CalendarViewDraft.allColumns} labelOf={EventTable.columnLabel}
    requiredColumn={EventTableColumn.Subject} requiredReason={$t`The list needs the Subject column`}
    onOK={columns => { draft.columns = columns; draft = draft; }} on:close={closeSub} />
{:else if open == "group-by"}
  <GroupByDialog {draft} onOK={changed => draft = changed} on:close={closeSub} />
{:else if open == "sort"}
  <SortDialog columnOptions={CalendarViewDraft.allColumns.map(column => ({ value: column, label: EventTable.columnLabel(column) }))}
    column={draft.sortColumn} ascending={draft.sortAscending}
    onOK={(column, ascending) => { draft.sortColumn = column; draft.sortAscending = ascending; draft = draft; }} on:close={closeSub} />
{:else if open == "other"}
  <OtherSettingsDialog {draft} onOK={changed => draft = changed} on:close={closeSub} />
{/if}

<script lang="ts">
  import { CalendarViewDraft } from "./CalendarViewDraft";
  import { EventTableColumn } from "../CalendarSettings";
  import { EventTable } from "../ListView/EventTable";
  import Dialog from "../../Shared/Dialog/Dialog.svelte";
  import DialogButton from "../../Shared/Dialog/DialogButton.svelte";
  import GroupBox from "../../Shared/Form/GroupBox.svelte";
  import ShowColumnsDialog from "../../Shared/ViewSettings/ShowColumnsDialog.svelte";
  import GroupByDialog from "./GroupByDialog.svelte";
  import SortDialog from "../../Shared/ViewSettings/SortDialog.svelte";
  import OtherSettingsDialog from "./OtherSettingsDialog.svelte";
  import { t } from "../../../l10n/l10n";

  export let isTable: boolean;

  let draft = CalendarViewDraft.fromSettings();
  let open: "columns" | "group-by" | "sort" | "other" | null = null;
  $: tableOnly = $t`Available in the List and Active views`;

  function closeSub() {
    open = null;
  }

  function reset() {
    draft = CalendarViewDraft.defaults();
  }

  function save() {
    draft.save();
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
  .summary.disabled {
    color: var(--lo-fg-secondary);
  }
</style>
