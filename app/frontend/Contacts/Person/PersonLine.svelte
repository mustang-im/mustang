<hbox flex class="person" class:selected={isSelected} {size} on:click>
  <PersonPicture {person} size={pictureSize} />
  <vbox flex class="main">
    <hbox class="first-row">
      <hbox flex class="name font-small">{$person.name}</hbox>
      <slot name="top-right" {person} />
    </hbox>
    <slot name="second-row" {person} />
  </vbox>
</hbox>

<script lang="ts">
  import type { PersonOrGroup } from "./PersonOrGroup";
  import PersonPicture from "./PersonPicture.svelte";

  export let person: PersonOrGroup;
  export let isSelected = false;
  export let pictureSize: number;
  export let size: "large" | "small" = "large";
</script>

<style>
  .person.selected {
    background-color: var(--selected-bg);
    color: var(--selected-fg);
  }
  .person:not(.selected):hover {
    background-color: var(--hover-bg);
    color: var(--hover-fg);
  }
  .main {
    justify-content: center;
    margin-block-start: 0px;
    padding: 10px 16px 10px 4px;
  }
  .name {
  }
  .person[size="small"] .main {
    padding: 1px 20px 0px 0px;
  }
  .person[size="small"] :global(.avatar) {
    margin: 2px 14px;
  }
</style>
