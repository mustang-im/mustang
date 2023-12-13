<hbox flex class="person" class:isSelected>
  <PersonPicture {person} />
  <vbox flex class="main">
    <hbox class="first-row">
      <hbox flex class="name">{person.name}</hbox>
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
</script>

<style>
  .person.isSelected {
    background-color: #20AE9E;
    color: white;
  }
  .person:not(.isSelected):hover {
    background-color: #A9DAD4;
  }
  .main {
    margin-top: 0px;
    padding: 10px;
  }
  .name {
    font-size: 14px;
  }
</style>
