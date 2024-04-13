<!-- svelte-ignore a11y-click-events-have-key-events -->
<hbox class="person" class:selected={open} class:no-pic={!person?.picture} on:click={onClick}>
  <PersonPicture person={person} size={24} />
  <vbox flex class="right">
    <hbox flex class="name">{person.name}</hbox>
  </vbox>
</hbox>
<!-- TODO proper dropdown menu -->
<vbox class="context-menu" class:open>
  <slot name="context-menu" {person} />
</vbox>

<script lang="ts">
  import type { Person } from "../../../logic/Abstract/Person";
  import PersonPicture from "../Person/PersonPicture.svelte";

  export let person: Person;

  let open = false;

  function onClick() {
    open = !open;
  }
</script>

<style>
  .person {
    background-color: white;
    border-radius: 100px;
    box-shadow: -1px 0px 5px 0.5px rgb(0, 0, 0, 7%);
    align-items: center;
    padding-right: 12px;
    height: 24px;
  }
  .person:not(.selected):hover {
    background-color: var(--hover-bg);
    color: var(--hover-fg);
  }
  .person.selected {
    background-color: var(--selected-bg);
    color: var(--selected-fg);
  }
  .person :global(.avatar) {
    margin: 0px;
    margin-right: 6px;
  }
  .name {
    align-items: center;
    white-space: nowrap;
  }

  .no-pic {
    padding-left: 14px;
  }
  .no-pic :global(.avatar) {
    display: none;
  }

  .context-menu:not(.open) {
    display: none;
  }
</style>
