<Dialog title={$t`Group By`} okLabel={$t`OK`} onOK={save} width="420px" on:close>
  <GroupBox label={$t`Group items by`}>
    <ComboBox options={groupOptions} bind:value={grouping} label={$t`Group items by`} width="200px" />
  </GroupBox>
</Dialog>

<script lang="ts">
  import { CalendarViewDraft } from "./CalendarViewDraft";
  import { EventTableGrouping } from "../CalendarSettings";
  import Dialog from "../../Shared/Dialog/Dialog.svelte";
  import GroupBox from "../../Shared/Form/GroupBox.svelte";
  import ComboBox from "../../Shared/Form/ComboBox.svelte";
  import { t } from "../../../l10n/l10n";

  export let draft: CalendarViewDraft;
  export let onOK: (draft: CalendarViewDraft) => void;

  let grouping = draft.grouping;

  $: groupOptions = [
    { value: EventTableGrouping.None, label: $t`(none)` },
    { value: EventTableGrouping.Recurrence, label: $t`Recurrence` },
  ];

  function save() {
    draft.grouping = grouping;
    onOK(draft);
  }
</script>
