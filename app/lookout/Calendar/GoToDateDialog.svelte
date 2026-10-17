<Dialog title={$t`Go To Date`}
  okLabel={$t`OK`}
  okDisabled={!selectedDate && $t`Enter a date`}
  onOK={onOK}
  width="340px"
  on:close>
  <FormGrid>
    <span>{$t`Date:`}</span>
    <DateField required bind:value={selectedDate} label={$t`Date`} width="100%" />
    <span>{$t`Show in:`}</span>
    <ComboBox options={viewOptions} bind:value={view} label={$t`Show in`} />
  </FormGrid>
</Dialog>

<script lang="ts">
  import type { CalendarViewType } from "./selected";
  import Dialog from "../Shared/Dialog/Dialog.svelte";
  import FormGrid from "../Shared/Form/FormGrid.svelte";
  import DateField from "../Shared/Form/DateField.svelte";
  import ComboBox from "../Shared/Form/ComboBox.svelte";
  import { t } from "../../l10n/l10n";

  export let date: Date;
  export let view: CalendarViewType;
  export let onGoTo: (date: Date, view: CalendarViewType) => void;

  let selectedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  $: viewOptions = [
    { value: "day", label: $t`Day Calendar` },
    { value: "workweek", label: $t`Work Week Calendar` },
    { value: "week", label: $t`Week Calendar` },
    { value: "month", label: $t`Month Calendar` },
    { value: "schedule", label: $t`Schedule View` },
    { value: "dual", label: $t`Day/Month` },
  ] as { value: CalendarViewType, label: string }[];

  function onOK() {
    onGoTo(selectedDate, view);
  }
</script>
