<hbox flex class="person" class:selected>
  <PersonPicture {person} />
  <vbox flex class="right">
    <hbox flex class="name">{person.name}</hbox>
  </vbox>
</hbox>

<script lang="ts">
  import type { PersonOrGroup } from "./PersonOrGroup";
  import PersonPicture from "./PersonPicture.svelte";

  export let person: PersonOrGroup;
  export let selected = false;
</script>

<style>
  .person.selected {
    background-color: #20AE9E;
    color: white;
  }
  .person:not(.selected):hover {
    background-color: #A9DAD4;
  }
  .right {
    margin-top: 0px;
    padding: 10px;
  }
  .name {
    font-size: 14px;
  }
</style>
