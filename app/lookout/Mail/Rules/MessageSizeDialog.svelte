<Dialog title={$t`Message Size`} okLabel={$t`OK`} onOK={onSubmit} on:close={onClose} width="380px"
  okDisabled={(!atLeast && !atMost && $t`Enter a size`) ||
    (!!atLeast && !!atMost && atLeast > atMost && $t`At least must not be larger than At most`)}>
  <vbox class="size">
    <span>{$t`Specify the size (in kilobytes) to check for:`}</span>
    <grid class="fields">
      <span>{$t`At least:`}</span>
      <SpinBox label={$t`At least:`} bind:value={atLeast} min={0} stepSize={10} suffix={$t`KB`} width="120px" />
      <span>{$t`At most:`}</span>
      <SpinBox label={$t`At most:`} bind:value={atMost} min={0} stepSize={10} suffix={$t`KB`} width="120px" />
    </grid>
  </vbox>
</Dialog>

<script lang="ts">
  import { RuleItems } from "./RuleItems";
  import Dialog from "../../Shared/Dialog/Dialog.svelte";
  import SpinBox from "../../Shared/Form/SpinBox.svelte";
  import { createEventDispatcher } from "svelte";
  import { t } from "../../../l10n/l10n";

  export let sizeMin: number | null;
  export let sizeMax: number | null;
  export let onOK: (sizeMin: number | null, sizeMax: number | null) => void;
  const dispatch = createEventDispatcher<{ close: void }>();

  let atLeast: number | null = RuleItems.kilobytes(sizeMin);
  let atMost: number | null = RuleItems.kilobytes(sizeMax);

  function onSubmit() {
    onOK(atLeast ? atLeast * 1024 : null, atMost ? atMost * 1024 : null);
  }

  function onClose() {
    dispatch("close");
  }
</script>

<style>
  .size {
    gap: 10px;
  }
  .fields {
    grid-template-columns: max-content max-content;
    align-items: center;
    gap: 8px 12px;
    margin-inline-start: 16px;
  }
</style>
