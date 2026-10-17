<Dialog title={$t`Save All Attachments`} okLabel={$t`OK`} onOK={onSave} width="420px"
  okDisabled={!chosen.length && $t`Select at least one attachment`}
  on:close>
  <vbox class="save-all">
    <span>{$t`Attachments:`}</span>
    <vbox class="list">
      {#each attachments as attachment (attachment)}
        <hbox class="row">
          <CheckBox label={attachment.filename} checked={chosen.includes(attachment)}
            onChange={checked => toggle(attachment, checked)} />
        </hbox>
      {/each}
    </vbox>
  </vbox>
</Dialog>

<script lang="ts">
  import type { Attachment } from "../../../logic/Abstract/Attachment";
  import Dialog from "../../Shared/Dialog/Dialog.svelte";
  import CheckBox from "../../Shared/Form/CheckBox.svelte";
  import { t } from "../../../l10n/l10n";

  export let attachments: Attachment[];

  let chosen = [...attachments];

  function toggle(attachment: Attachment, checked: boolean) {
    chosen = checked
      ? [...chosen, attachment]
      : chosen.filter(existing => existing != attachment);
  }

  async function onSave() {
    for (let attachment of chosen) {
      await attachment.saveFile();
    }
  }
</script>

<style>
  .save-all {
    gap: 6px;
  }
  .list {
    max-height: 240px;
    overflow-y: auto;
    padding: 4px 8px;
    border: 1px solid var(--lo-input-border);
    border-radius: var(--lo-radius-small);
    background-color: var(--lo-input-bg);
  }
  .row {
    min-height: 28px;
    align-items: center;
  }
</style>
