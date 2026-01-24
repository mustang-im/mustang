<vbox class="poll">
  <fieldset>
    <legend class="question font-normal">{poll.name}</legend>
    {#each ensureArray(poll.options) as option}
      <label class="option">
        <input type="radio" name="poll" value={option} on:change={() => onSelect(option)}>
        <vbox>
          <hbox class="title">{option.name}</hbox>
          {#if option.description}
            <hbox class="description">{option.description}</hbox>
          {/if}
        </vbox>
      </label>
    {/each}
  </fieldset>
</vbox>

<script lang="ts">
  import { SMLData } from "../../../logic/Mail/SML/SMLParseProcessor";
  import type { TSMLSimplePoll, TSMLThing } from "../../../logic/Mail/SML/TSML";
  import { ensureArray } from "../../../logic/util/util";

  export let sml: SMLData;
  $: poll = $sml.sml as any as TSMLSimplePoll<TSMLThing>;

  function onSelect(option: TSMLThing) {
    //poll.object = option;
  }
</script>

<style>
  fieldset {
    border: none;
    margin: 24px 12px 12px 12px;
  }
  legend.question {
    margin-block-end: 4px;
    font-weight: bold;
  }
  label.option {
    display: flex;
    align-items: start;
  }
  input {
    margin-block-start: 5px;
    margin-inline-end: 12px;
  }
  .title {
    font-weight: bold;
  }
</style>
