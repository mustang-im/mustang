<Dialog title={title ?? $t`Sort`} okLabel={$t`OK`} onOK={() => { dispatch("change", { column: sortColumn, ascending: sortAscending }); }} width="420px" on:close>
  <GroupBox label={itemsLabel ?? $t`Sort items by`}>
    <hbox class="sort-row">
      <ComboBox options={columnOptions} bind:value={sortColumn} label={itemsLabel ?? $t`Sort items by`} width="200px" />
      <vbox class="order">
        <Radio label={$t`Ascending`} bind:group={sortAscending} value={true} />
        <Radio label={$t`Descending`} bind:group={sortAscending} value={false} />
      </vbox>
    </hbox>
  </GroupBox>
</Dialog>

<script lang="ts">
  import type { ComboOption } from "../Form/ComboOption";
  import Dialog from "../Dialog/Dialog.svelte";
  import GroupBox from "../Form/GroupBox.svelte";
  import ComboBox from "../Form/ComboBox.svelte";
  import Radio from "../Form/Radio.svelte";
  import { createEventDispatcher } from "svelte";
  import { t } from "../../../l10n/l10n";

  type T = $$Generic;
  export let columnOptions: ComboOption<T>[];
  export let column: T;
  export let ascending: boolean;
  export let title: string = null;
  export let itemsLabel: string = null;
  const dispatch = createEventDispatcher<{ change: { column: T, ascending: boolean } }>();

  let sortColumn = column;
  let sortAscending = ascending;
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
