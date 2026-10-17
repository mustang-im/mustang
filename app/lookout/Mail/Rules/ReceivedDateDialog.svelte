<Dialog title={$t`Received`} okLabel={$t`OK`} onOK={onSubmit} on:close={onClose} width="360px"
  okDisabled={(!hasAfter && !hasBefore && $t`Choose After, Before or both`) ||
    (hasAfter && !after && $t`Enter the date for After`) ||
    (hasBefore && !before && $t`Enter the date for Before`)}>
  <grid class="received">
    <CheckBox label={$t`After`} bind:checked={hasAfter} />
    <DateField label={$t`After`} bind:value={after} disabled={!hasAfter} onChange={() => { hasAfter = true; }} />
    <CheckBox label={$t`Before`} bind:checked={hasBefore} />
    <DateField label={$t`Before`} bind:value={before} disabled={!hasBefore} onChange={() => { hasBefore = true; }} />
  </grid>
</Dialog>

<script lang="ts">
  import { RuleItems } from "./RuleItems";
  import Dialog from "../../Shared/Dialog/Dialog.svelte";
  import CheckBox from "../../Shared/Form/CheckBox.svelte";
  import DateField from "../../Shared/Form/DateField.svelte";
  import { t } from "../../../l10n/l10n";

  export let sentDateMin: Date | null;
  export let sentDateMax: Date | null;
  export let onOK: (sentDateMin: Date | null, sentDateMax: Date | null) => void;
  export let onClose: () => void;

  let after: Date | null = RuleItems.afterDay(sentDateMin);
  let before: Date | null = RuleItems.beforeDay(sentDateMax);
  let hasAfter = !!after;
  let hasBefore = !!before;

  function onSubmit() {
    onOK(
      hasAfter ? RuleItems.sentDateMin(after) : null,
      hasBefore ? RuleItems.sentDateMax(before) : null);
  }
</script>

<style>
  .received {
    grid-template-columns: max-content 1fr;
    align-items: center;
    gap: 10px 12px;
    padding-block: 4px;
  }
</style>
