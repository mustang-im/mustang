<Dialog title={$t`Received`} okLabel={$t`OK`} onOK={onSubmit} on:close={onClose} width="360px"
  okDisabled={(!hasAfter && !hasBefore && $t`Choose After, Before or both`) ||
    (hasAfter && !after && $t`Enter the date for After`) ||
    (hasBefore && !before && $t`Enter the date for Before`)}>
  <grid class="received">
    <label class="check">
      <input type="checkbox" bind:checked={hasAfter} />
      {$t`After`}
    </label>
    <input type="date" class="lo-text-field" bind:value={after} disabled={!hasAfter} aria-label={$t`After`}
      on:input={() => hasAfter = true} />
    <label class="check">
      <input type="checkbox" bind:checked={hasBefore} />
      {$t`Before`}
    </label>
    <input type="date" class="lo-text-field" bind:value={before} disabled={!hasBefore} aria-label={$t`Before`}
      on:input={() => hasBefore = true} />
  </grid>
</Dialog>

<script lang="ts">
  import { RuleItems } from "../RuleItems";
  import Dialog from "../../../Shared/Dialog/Dialog.svelte";
  import { t } from "../../../../l10n/l10n";

  export let sentDateMin: Date | null;
  export let sentDateMax: Date | null;
  export let onOK: (sentDateMin: Date | null, sentDateMax: Date | null) => void;
  export let onClose: () => void;

  let after = toField(RuleItems.afterDay(sentDateMin));
  let before = toField(RuleItems.beforeDay(sentDateMax));
  let hasAfter = !!after;
  let hasBefore = !!before;

  function toField(date: Date | null): string {
    if (!date) {
      return "";
    }
    let month = String(date.getMonth() + 1).padStart(2, "0");
    let day = String(date.getDate()).padStart(2, "0");
    return `${date.getFullYear()}-${month}-${day}`;
  }

  function fromField(value: string): Date | null {
    let [year, month, day] = value.split("-").map(Number);
    return year && month && day ? new Date(year, month - 1, day) : null;
  }

  function onSubmit() {
    onOK(
      hasAfter ? RuleItems.sentDateMin(fromField(after)) : null,
      hasBefore ? RuleItems.sentDateMax(fromField(before)) : null);
  }
</script>

<style>
  .received {
    grid-template-columns: max-content 1fr;
    align-items: center;
    gap: 10px 12px;
    padding-block: 4px;
  }
  .check {
    display: flex;
    align-items: center;
    gap: 8px;
  }
</style>
