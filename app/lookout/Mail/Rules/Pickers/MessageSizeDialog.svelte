<Dialog title={$t`Message Size`} okLabel={$t`OK`} onOK={onSubmit} on:close={onClose} width="380px"
  okDisabled={(!atLeast && !atMost && $t`Enter a size`) ||
    (!!atLeast && !!atMost && atLeast > atMost && $t`At least must not be larger than At most`)}>
  <vbox class="size">
    <span>{$t`Specify the size (in kilobytes) to check for:`}</span>
    <grid class="fields">
      <label for="message-size-min">{$t`At least:`}</label>
      <input id="message-size-min" class="lo-text-field" type="number" min="0" step="1" bind:value={atLeast} />
      <label for="message-size-max">{$t`At most:`}</label>
      <input id="message-size-max" class="lo-text-field" type="number" min="0" step="1" bind:value={atMost} />
    </grid>
  </vbox>
</Dialog>

<script lang="ts">
  import { RuleItems } from "../RuleItems";
  import Dialog from "../../../Shared/Dialog/Dialog.svelte";
  import { t } from "../../../../l10n/l10n";

  export let sizeMin: number | null;
  export let sizeMax: number | null;
  export let onOK: (sizeMin: number | null, sizeMax: number | null) => void;
  export let onClose: () => void;

  let atLeast: number | null = RuleItems.kilobytes(sizeMin);
  let atMost: number | null = RuleItems.kilobytes(sizeMax);

  function onSubmit() {
    onOK(atLeast ? atLeast * 1024 : null, atMost ? atMost * 1024 : null);
  }
</script>

<style>
  .size {
    gap: 10px;
  }
  .fields {
    grid-template-columns: max-content 120px;
    align-items: center;
    gap: 8px 12px;
    margin-inline-start: 16px;
  }
</style>
