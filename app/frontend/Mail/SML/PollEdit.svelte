<vbox class="poll-create" bind:this={pollE}>
  <hbox class="question">
    {$t`Question`}
    <input type="text" bind:value={choose.description} />
  </hbox>
  {$t`Possible answers`}
  {#each choose.actionOption as option}
    <vbox>
      <hbox class="option">
        <input type="radio" name="poll" disabled>
        <input type="text" class="title" bind:value={option.name} />
      </hbox>
      <input type="text" class="description" bind:value={option.description} />
    </vbox>
  {/each}
  <vbox>
    <hbox class="new">
      <input type="radio" name="poll" disabled>
      <input type="text" class="title" bind:value={newLine} on:input={onNewLine} />
    </hbox>
  </vbox>
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
    let textInputs = pollE.querySelectorAll(".option .title");
    let newTextInput = textInputs[textInputs.length - 1] as HTMLInputElement;
    newTextInput.focus();
  }
</script>

<style>
  .question {
    font-weight: bold;
  }
  .title {
    font-weight: bold;
  }
</style>
