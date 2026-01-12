<vbox class="poll-create" bind:this={pollE}>
  <hbox class="question">
    <hbox class="label">{$t`Question`}</hbox>
    <input type="text" bind:value={choose.description} />
  </hbox>
  <hbox class="label answers">{$t`Possible answers`}</hbox>
  {#each choose.actionOption as option}
    <hbox class="option added">
      <input type="radio" name="poll" disabled>
      <vbox>
        <input type="text" class="title" bind:value={option.name} />
        <input type="text" class="description" bind:value={option.description} />
      </vbox>
    </hbox>
  {/each}
    <hbox class="option new">
      <input type="radio" name="poll" disabled>
      <vbox>
        <input type="text" class="title" bind:value={newLine} on:input={onNewLine} />
      </vbox>
    </hbox>
</vbox>

<script lang="ts">
  import { SMLData } from "../../../logic/Mail/SML/SMLParseProcessor";
  import type { TSMLChooseAction, TSMLThing } from "../../../logic/Mail/SML/TSML";
  import { t } from "../../../l10n/l10n";
  import { tick } from "svelte";

  export let sml: SMLData;
  $: choose = $sml.sml as TSMLChooseAction;

  function addOption(title?: string) {
    choose.actionOption.push({
      "@type": "Answer",
      name: title,
      description: "",
    } as TSMLThing);
    choose = choose;
  }

  let newLine: string;
  let pollE: HTMLElement;
  async function onNewLine() {
    addOption(newLine);
    newLine = "";
    await tick();
    let textInputs = pollE.querySelectorAll(".option.added .title");
    let newTextInput = textInputs[textInputs.length - 1] as HTMLInputElement;
    newTextInput.focus();
  }
</script>

<style>
  .label {
    white-space: nowrap;
    margin-inline-end: 12px;
    opacity: 70%;
  }
  .question {
    align-items: baseline;
  }
  .question input {
    font-weight: bold;
  }
  .answers {
    margin-block-start: 12px;
    margin-block-end: 6px;
  }
  .option {
    align-items: start;
  }
  input[type=radio] {
    margin-inline-end: 12px;
    margin-block-start: 6px;
  }
  input[type=text] {
    margin-block: 4px;
  }
  .title {
    font-weight: bold;
  }
</style>
