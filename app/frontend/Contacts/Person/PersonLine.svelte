<hbox flex class="person" class:selected={isSelected} on:click>
  <PersonPicture {person} size={pictureSize} />
  <vbox flex class="main">
    <hbox class="first-row">
      <hbox flex class="name {fontClass}">{$person.name}</hbox>
      <slot name="top-right" {person} />
    </hbox>
    <hbox class="second-row">
      <slot name="second-row" {person} />
    </hbox>
  </vbox>
</hbox>

<script lang="ts">
  import type { PersonOrGroup } from "./PersonOrGroup";
  import { appGlobal } from "../../../logic/app";
  import PersonPicture from "./PersonPicture.svelte";

  export let person: PersonOrGroup;
  export let isSelected = false;
  export let pictureSize: number;

  $: fontClass = appGlobal.isMobile ? "font-normal" : "font-small";
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
  .person :global(.avatar) {
    margin: 2px 14px;
  }
  .main {
    justify-content: center;
    margin-block-start: 0px;
    padding: 1px 20px 0px 0px;
  }
  :global(.mobile) .main {
    min-height: 44px;
  }
  .first-row {
    height: 1.3em; /* prevent line breaks */
  }
  .name {
    align-items: center;
  }
  .second-row:first-child {
    max-height: 1.3em;
  }
</style>
