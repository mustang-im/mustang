<hbox class="persons-toolbar">
  <AccountDropDown />
  <hbox flex />
  <hbox class="buttons">
    <RoundButton label="New contact" icon={NewContactIcon} iconSize="22px" padding="9px" classes="large create" on:click={addPerson} />
  </hbox>
</hbox>

<script lang="ts">
  import { ChatPerson } from "../../logic/Chat/Person";
  import type { Person } from "../../logic/Abstract/Person";
  import AccountDropDown from "../Mail/AccountDropDown.svelte";
  import RoundButton from "../Shared/RoundButton.svelte";
  import NewContactIcon from "lucide-svelte/icons/plus";
  import type { Collection } from "svelte-collections";

  export let persons: Collection<Person>;
  export let selected: Person = null;

  function addPerson() {
    let person = new ChatPerson();
    persons.add(person);
    selected = person;
  }
</script>

<style>
  .persons-toolbar {
    margin: 10px 12px 10px 16px;
    align-items: center;
  }
</style>
