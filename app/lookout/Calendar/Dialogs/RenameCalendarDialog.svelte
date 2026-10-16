<Dialog title={$t`Rename Calendar`}
  okLabel={$t`OK`}
  okDisabled={!name.trim() && $t`Enter a name for the calendar`}
  onOK={onOK}
  width="400px"
  on:close>
  <label class="field">
    <span class="label">{$t`New name:`}</span>
    <input type="text" class="lo-text-field" bind:value={name} />
  </label>
</Dialog>

<script lang="ts">
  import type { Calendar } from "../../../logic/Calendar/Calendar";
  import Dialog from "../../Shared/Dialog/Dialog.svelte";
  import { t } from "../../../l10n/l10n";

  export let calendar: Calendar;

  let name = calendar.name;

  async function onOK() {
    let trimmed = name.trim();
    if (trimmed == calendar.name) {
      return;
    }
    calendar.name = trimmed;
    await calendar.save();
  }
</script>

<style>
  .field {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .label {
    font-size: var(--lo-font-size-small);
    color: var(--lo-fg-secondary);
  }
</style>
