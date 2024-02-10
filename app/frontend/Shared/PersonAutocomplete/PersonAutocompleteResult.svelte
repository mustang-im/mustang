<hbox flex class="person">
  <PersonPicture person={person} size={32} />
  <vbox flex class="right">
    <hbox class="top-row">
      <hbox flex class="name">{person.name}</hbox>
    </hbox>
    <hbox class="bottom-row">
      <slot name="bottom-row" />
  </vbox>
</hbox>

<script lang="ts">
  import type { Person } from "../../../logic/Abstract/Person";
  import PersonPicture from "../Person/PersonPicture.svelte";

  export let person: Person;
</script>

<style>
  .person,
  .name {
    align-items: center;
  }
  .person :global(.avatar) {
    margin: 0px;
    margin-right: 6px;
  }
  .top-row,
  .bottom-row {
    height: 16px;
  }
</style>
