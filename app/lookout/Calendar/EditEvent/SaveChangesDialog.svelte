<Dialog title={$t`Close`} okLabel={saveLabel} okDisabled={saveDisabled} onOK={onSave} on:close={onCancel}>
  <p class="question">{question}</p>
  <svelte:fragment slot="buttons-start">
    <DialogButton label={discardLabel} onClick={onDiscard} />
  </svelte:fragment>
</Dialog>

<script lang="ts">
  import Dialog from "../../Mail/Dialogs/Dialog.svelte";
  import DialogButton from "./DialogButton.svelte";
  import { t } from "../../../l10n/l10n";

  export let question: string;
  export let saveLabel: string;
  export let discardLabel: string;
  export let saveDisabled: string | false = false;
  export let onSave: () => Promise<void>;
  export let onDiscard: () => void;
  export let onCancel: () => void;
</script>

<style>
  .question {
    margin: 0;
  }
</style>
