<AddressbookSelector bind:selectedAddressbook
  on:select={() => catchErrors(() => onChangeAddressbook(selectedAddressbook))} />

<script lang="ts">
  import type { Addressbook } from "../../logic/Contacts/Addressbook";
  import type { Person } from "../../logic/Abstract/Person";
  import AddressbookSelector from "./AddressbookSelector.svelte";
  import { catchErrors } from "../Util/error";

  export let person: Person;

  let selectedAddressbook: Addressbook;
  $: selectedAddressbook = person?.addressbook;

  async function onChangeAddressbook(newAddressbook: Addressbook) {
    console.log("Selected addressbook", newAddressbook?.name, "old", person?.addressbook?.name);
    if (person?.addressbook == newAddressbook || !newAddressbook) {
      return;
    }
    person.addressbook?.persons.remove(person);
    person.addressbook = newAddressbook;
    newAddressbook.persons.add(person);
    await person.save();
  }
</script>
