<Dialog title={$t`Format Day/Week/Month View`} okLabel={$t`OK`} onOK={save} width="480px" on:close>
  <vbox class="other-settings">
    <GroupBox label={$t`Day and Week`}>
      <hbox class="field-row">
        <span>{$t`Time scale:`}</span>
        <ComboBox options={timeScaleOptions} bind:value={timeScale} label={$t`Time scale`} width="260px" />
      </hbox>
    </GroupBox>
    <GroupBox label={$t`Month and Date Navigator`}>
      <CheckBox label={$t`Show week numbers in the Month View and in the Date Navigator`} bind:checked={weekNumbers} />
    </GroupBox>
    <GroupBox label={$t`Meetings`}>
      <CheckBox label={$t`Show declined meetings`} bind:checked={showDeclined} />
    </GroupBox>
  </vbox>
</Dialog>

<script lang="ts">
  import { CalendarViewDraft } from "./CalendarViewDraft";
  import { CalendarSettings } from "../CalendarSettings";
  import Dialog from "../../Shared/Dialog/Dialog.svelte";
  import GroupBox from "../../Shared/Form/GroupBox.svelte";
  import CheckBox from "../../Shared/Form/CheckBox.svelte";
  import ComboBox from "../../Shared/Form/ComboBox.svelte";
  import { t } from "../../../l10n/l10n";

  export let draft: CalendarViewDraft;
  export let onOK: (draft: CalendarViewDraft) => void;

  let timeScale = draft.timeScale;
  let weekNumbers = draft.weekNumbers;
  let showDeclined = draft.showDeclined;

  const timeScaleOptions = CalendarSettings.timeScales.map(minutes => ({ value: minutes, label: CalendarSettings.timeScaleLabel(minutes) }));

  function save() {
    draft.timeScale = timeScale;
    draft.weekNumbers = weekNumbers;
    draft.showDeclined = showDeclined;
    onOK(draft);
  }
</script>

<style>
  .other-settings {
    gap: 12px;
  }
  .field-row {
    align-items: center;
    gap: 12px;
  }
</style>
