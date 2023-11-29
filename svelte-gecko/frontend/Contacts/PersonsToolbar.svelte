<hbox class="persons-toolbar">
  <input type="search" bind:value={searchText} placeholder="Search for a person or group" />
  <hbox flex />
  <hbox class="new">
    <RoundButton label="New contact" icon={NewContactIcon} iconSize="24px" filled on:click={addPerson} />
  </hbox>
</hbox>

<script lang="ts">
  import { ChatPerson } from "../../logic/Chat/Person";
  import type { Person } from "../../logic/Abstract/Person";
  import type { Collection } from "svelte-collections";
  import RoundButton from "../Shared/RoundButton.svelte";
  import NewContactIcon from "lucide-svelte/icons/plus";

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
    margin-right: 24px;
    height: 32px;
    padding: 0px 8px;
    border: 1px solid #BAB7BF;
    border-radius: 4px;
  }
  input::placeholder {
    color: #808080;
  }
</style>
