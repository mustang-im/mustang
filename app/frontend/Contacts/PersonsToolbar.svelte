<hbox class="persons-toolbar">
  <AccountDropDown
    accounts={appGlobal.addressbooks}
    bind:selectedAccount={selectedAddressbook} />
  <hbox flex />
  <hbox class="buttons">
    <RoundButton label="New contact" icon={NewContactIcon} iconSize="22px" padding="9px" classes="large create" on:click={addPerson} />
  </hbox>
</hbox>

<script lang="ts">
  import { Person } from "../../logic/Abstract/Person";
  import { selectedPerson } from "../Shared/Person/PersonOrGroup";
  import type { Addressbook } from "../../logic/Contacts/Addressbook";
  import { appGlobal } from "../../logic/app";
  import AccountDropDown from "../Shared/AccountDropDown.svelte";
  import RoundButton from "../Shared/RoundButton.svelte";
  import NewContactIcon from "lucide-svelte/icons/plus";
  import type { Collection } from "svelte-collections";

  /** in */
  export let persons: Collection<Person>;
  /** in/out */
  export let selectedAddressbook: Addressbook;

  function addPerson() {
    let person = new Person(selectedAddressbook);
    person.name = "New person";
    persons.add(person);
    $selectedPerson = person;
  }
</script>

<style>
  .persons-toolbar {
    margin: 10px 12px 10px 16px;
    align-items: center;
  }
</style>
