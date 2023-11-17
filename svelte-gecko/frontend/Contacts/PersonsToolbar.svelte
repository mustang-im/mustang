<hbox class="persons-toolbar">
  <input type="search" bind:value={searchText} placeholder="Search for a name" />
  <hbox flex />
  <RoundButton label="New contact" icon={newContact} iconSize="32px" filled on:click={addPerson} />
</hbox>

<script lang="ts">
  import { ChatPerson } from "../../logic/Chat/Person";
  import type { Person } from "../../logic/Abstract/Person";
  import type { Collection } from "svelte-collections";
  import RoundButton from "../Shared/RoundButton.svelte";
  import newContact from '../asset/icon/contacts/newContact.svg?raw';

  export let persons: Collection<Person>;
  export let selected: Person = null;

  function addPerson() {
    let person = new ChatPerson();
    persons.add(person);
    selected = person;
  }

  let searchText: string;
</script>

<style>
  .persons-toolbar {
    margin: 16px;
    align-items: center;
  }
  input[type="search"] {
    width: 100%;
    border: none;
    margin-right: 24px;
    height: 2em;
    padding: 0px 8px;
  }
</style>
