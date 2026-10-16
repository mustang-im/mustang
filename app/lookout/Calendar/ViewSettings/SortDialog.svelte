<Dialog title={$t`Sort`} okLabel={$t`OK`} onOK={save} width="420px" on:close>
  <GroupBox label={$t`Sort items by`}>
    <hbox class="sort-row">
      <ComboBox options={columnOptions} bind:value={sortColumn} label={$t`Sort items by`} width="200px" />
      <vbox class="order">
        <Radio label={$t`Ascending`} bind:group={sortAscending} value={true} />
        <Radio label={$t`Descending`} bind:group={sortAscending} value={false} />
      </vbox>
    </hbox>
  </GroupBox>
</Dialog>

<script lang="ts">
  import { CalendarViewDraft } from "./CalendarViewDraft";
  import { EventTable } from "../ListView/EventTable";
  import Dialog from "../../Shared/Dialog/Dialog.svelte";
  import GroupBox from "../../Shared/Form/GroupBox.svelte";
  import ComboBox from "../../Shared/Form/ComboBox.svelte";
  import Radio from "../../Shared/Form/Radio.svelte";
  import { t } from "../../../l10n/l10n";

  export let draft: CalendarViewDraft;
  export let onOK: (draft: CalendarViewDraft) => void;

  let sortColumn = draft.sortColumn;
  let sortAscending = draft.sortAscending;

  const columnOptions = CalendarViewDraft.allColumns.map(column => ({ value: column, label: EventTable.columnLabel(column) }));

  function save() {
    draft.sortColumn = sortColumn;
    draft.sortAscending = sortAscending;
    onOK(draft);
  }
</script>

<style>
  .sort-row {
    align-items: center;
    gap: 24px;
  }
  .order {
    gap: 4px;
  }
</style>
