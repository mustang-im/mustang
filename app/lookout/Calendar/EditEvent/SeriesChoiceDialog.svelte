<Dialog title={title} okLabel={okLabel} onOK={() => flow.saveWith(choice)} on:close={onClose}>
  <p class="question">{$t`This is one occurrence in a series. What do you want to change?`}</p>
  <vbox class="choices">
    {#each choices as option}
      <Radio label={flow.seriesChoiceLabel(option)} name="series-choice" value={option} bind:group={choice}
        disabled={flow.seriesChoiceDisabled(option)} />
    {/each}
  </vbox>
</Dialog>

<script lang="ts">
  import type { EventEditFlow, SeriesChoice } from "./EventEditFlow";
  import Dialog from "../../Shared/Dialog/Dialog.svelte";
  import Radio from "../../Shared/Form/Radio.svelte";
  import { createEventDispatcher } from "svelte";
  import { t } from "../../../l10n/l10n";

  export let title: string;
  export let okLabel: string;
  export let flow: EventEditFlow;

  const dispatch = createEventDispatcher<{ close: void }>();

  const choices = flow.seriesChoices();
  let choice: SeriesChoice = choices.find(option => !flow.seriesChoiceDisabled(option));

  function onClose() {
    dispatch("close");
  }
</script>

<style>
  .question {
    margin: 0 0 12px 0;
  }
  .choices {
    gap: 6px;
  }
</style>
