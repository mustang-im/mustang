<Dialog title={title ?? $t`Sort`} okLabel={$t`OK`} onOK={() => onOK(sortColumn, sortAscending)} width="420px" on:close>
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
  import type { ComboOption } from "../../Shared/Form/ComboOption";
  import Dialog from "../../Shared/Dialog/Dialog.svelte";
  import GroupBox from "../../Shared/Form/GroupBox.svelte";
  import ComboBox from "../../Shared/Form/ComboBox.svelte";
  import Radio from "../../Shared/Form/Radio.svelte";
  import { t } from "../../../l10n/l10n";

  type T = $$Generic;
  export let columnOptions: ComboOption<T>[];
  export let column: T;
  export let ascending: boolean;
  export let onOK: (column: T, ascending: boolean) => void;
  export let title: string = null;
  export let itemsLabel: string = null;

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
