<Dialog title={$t`Reading Pane`}
  okLabel={$t`OK`}
  okDisabled={isMarkingRead && !isValidDelay && $t`Enter 0 to 20 seconds`}
  onOK={onSave}
  on:close>
  <vbox class="dialog-content">
    <label class="checkbox">
      <input type="checkbox" bind:checked={isMarkingRead} />
      {$t`Mark items as read when viewed in the Reading Pane`}
    </label>
    <label class="delay" class:disabled={!isMarkingRead}>
      {$t`Wait`}
      <input type="number" min="0" max="20" step="1" bind:value={delay} disabled={!isMarkingRead} />
      {$t`seconds before marking item as read`}
    </label>
  </vbox>
</Dialog>

<script lang="ts">
  import { MailView } from "../MailView";
  import Dialog from "./Dialog.svelte";
  import { t } from "../../../l10n/l10n";

  let current = MailView.readAfter.value;
  let isMarkingRead = current >= 0;
  let delay = Math.max(current, 0);
  $: isValidDelay = Number.isInteger(delay) && delay >= 0 && delay <= 20;

  function onSave() {
    MailView.readAfter.value = isMarkingRead ? delay : -1;
  }
</script>

<style>
  .dialog-content {
    gap: 12px;
  }
  .checkbox {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .delay {
    display: flex;
    align-items: center;
    gap: 8px;
    padding-inline-start: 26px;
  }
  .delay.disabled {
    color: var(--lo-fg-disabled);
  }
  .delay input {
    width: 56px;
    height: 28px;
    padding: 0 6px;
    border: 1px solid var(--lo-input-border);
    border-radius: var(--lo-radius-small);
    background-color: var(--lo-input-bg);
    color: var(--lo-fg);
    font: inherit;
  }
</style>
