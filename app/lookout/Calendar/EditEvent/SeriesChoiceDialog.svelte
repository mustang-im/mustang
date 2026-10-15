<Dialog title={title} okLabel={okLabel} onOK={() => onChoose(choice)} on:close={onClose}>
  <p class="question">{$t`This is one occurrence in a series. What do you want to change?`}</p>
  <vbox class="choices">
    {#each choices as option}
      <label class="radio">
        <input type="radio" name="series-choice" value={option} bind:group={choice} />
        {labels[option]}
      </label>
    {/each}
  </vbox>
</Dialog>

<script lang="ts">
  import type { SeriesChoice } from "./EventEditFlow";
  import Dialog from "../../Shared/Dialog/Dialog.svelte";
  import { gt, t } from "../../../l10n/l10n";

  export let title: string;
  export let okLabel: string;
  export let choices: SeriesChoice[];
  export let onChoose: (choice: SeriesChoice) => Promise<void>;
  export let onClose: () => void;

  let choice: SeriesChoice = choices[0];

  const labels: Record<SeriesChoice, string> = {
    occurrence: gt`Just this one`,
    following: gt`This and all following occurrences`,
    series: gt`The entire series`,
  };
</script>

<style>
  .question {
    margin: 0 0 12px 0;
  }
  .choices {
    gap: 6px;
  }
  .radio {
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: 28px;
    cursor: pointer;
  }
  .radio input {
    width: 16px;
    height: 16px;
    margin: 0;
    accent-color: var(--lo-accent);
  }
</style>
