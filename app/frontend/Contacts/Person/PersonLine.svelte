<hbox flex class="person" class:selected={isSelected} {size}>
  <PersonPicture {person} size={pictureSize} />
  <vbox flex class="main">
    <hbox class="first-row">
      <hbox flex class="name font-small">{$person.name}</hbox>
      <slot name="top-right" {person} />
    </hbox>
    <hbox class="second-row">
      <slot name="second-row" {person} />
    </hbox>
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
  .first-row {
    height: 1.3em; /* prevent line breaks */
  }
  .second-row:first-child {
    max-height: 1.3em;
  }
  .main {
    margin-block-start: 0px;
    padding: 10px 16px 10px 4px;
  }
  .person[size="small"] .main {
    padding: 1px 20px 0px 0px;
  }
  .person[size="small"] :global(.avatar) {
    margin: 2px 14px;
  }
</style>
