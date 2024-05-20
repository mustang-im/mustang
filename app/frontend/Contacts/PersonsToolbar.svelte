<hbox class="persons-toolbar">
  <Scroll>
    <AddressbookSelector bind:selectedAddressbook />
  </Scroll>
  <hbox flex />
  <hbox class="buttons">
    <RoundButton
      label="New contact"
      icon={NewContactIcon}
      iconSize="22px" padding="9px" classes="large create"
      onClick={addPerson}
      />
  </hbox>
</hbox>

<script lang="ts">
  import { Person } from "../../logic/Abstract/Person";
  import { selectedPerson } from "../Shared/Person/Selected";
  import type { Addressbook } from "../../logic/Contacts/Addressbook";
  import AddressbookSelector from "./AddressbookSelector.svelte";
  import RoundButton from "../Shared/RoundButton.svelte";
  import Scroll from "../Shared/Scroll.svelte";
  import NewContactIcon from "lucide-svelte/icons/plus";
  import type { Collection } from "svelte-collections";

  /** in */
  export let persons: Collection<Person>;
  /** in/out */
  export let selectedAddressbook: Addressbook;

  function addPerson() {
    //assert(persons instanceof ArrayColl, "Please exit the search before adding a person");
    let person = selectedAddressbook.newPerson();
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
