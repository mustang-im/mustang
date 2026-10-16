<Dialog title={$t`Show Columns`} okLabel={$t`OK`} onOK={save} width="560px" on:close>
  <hbox class="show-columns">
    <vbox class="list">
      <span>{$t`Available columns:`}</span>
      <ListView items={available} bind:selected={availableSelected} label={$t`Available columns`}
        onOpen={add} height="220px" let:item>
        <span>{EventTable.columnLabel(item)}</span>
      </ListView>
    </vbox>
    <vbox class="middle">
      <DialogButton label={$t`Add ->`} onClick={() => add(availableSelected)}
        disabled={!availableSelected && $t`Choose a column on the left`} />
      <DialogButton label={$t`<- Remove`} onClick={remove}
        disabled={(!shownSelected || shownSelected == EventTableColumn.Subject) && $t`Choose a column on the right, other than Subject`} />
    </vbox>
    <vbox class="list">
      <span>{$t`Show these columns in this order:`}</span>
      <ListView items={columns} bind:selected={shownSelected} label={$t`Shown columns`}
        onOpen={() => remove()} height="220px" let:item>
        <span>{EventTable.columnLabel(item)}</span>
      </ListView>
      <hbox class="order-buttons">
        <DialogButton label={$t`Move Up`} onClick={() => move(-1)}
          disabled={!shownSelected || columns.indexOf(shownSelected) == 0} />
        <DialogButton label={$t`Move Down`} onClick={() => move(1)}
          disabled={!shownSelected || columns.indexOf(shownSelected) == columns.length - 1} />
      </hbox>
    </vbox>
  </hbox>
</Dialog>

<script lang="ts">
  import { CalendarViewDraft } from "./CalendarViewDraft";
  import { EventTableColumn } from "../CalendarSettings";
  import { EventTable } from "../ListView/EventTable";
  import Dialog from "../../Shared/Dialog/Dialog.svelte";
  import DialogButton from "../../Shared/Dialog/DialogButton.svelte";
  import ListView from "../../Shared/Form/ListView.svelte";
  import { t } from "../../../l10n/l10n";

  export let draft: CalendarViewDraft;
  export let onOK: (draft: CalendarViewDraft) => void;

  let working = Object.assign(new CalendarViewDraft(), draft, { columns: [...draft.columns] });
  let availableSelected: EventTableColumn = null;
  let shownSelected: EventTableColumn = null;

  $: columns = working.columns;
  $: available = working.columns && working.availableColumns();

  function add(column: EventTableColumn) {
    if (!column) {
      return;
    }
    working.addColumn(column);
    working = working;
    shownSelected = column;
    availableSelected = null;
  }

  function remove() {
    if (!shownSelected) {
      return;
    }
    working.removeColumn(shownSelected);
    working = working;
    availableSelected = shownSelected;
    shownSelected = null;
  }

  function move(offset: number) {
    working.moveColumn(shownSelected, offset);
    working = working;
  }

  function save() {
    draft.columns = working.columns;
    onOK(draft);
  }
</script>

<style>
  .show-columns {
    gap: 12px;
    align-items: stretch;
  }
  .list {
    flex: 1 1 0;
    min-width: 0;
    gap: 4px;
  }
  .middle {
    justify-content: center;
    gap: 8px;
  }
  .order-buttons {
    gap: 8px;
    margin-block-start: 4px;
  }
</style>
