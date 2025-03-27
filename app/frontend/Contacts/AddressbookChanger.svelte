<AccountDropDown
  bind:selectedAccount={selectedAddressbook}
  accounts={addressbooks}
  on:select={() => catchErrors(() => onChangeAddressbook(selectedAddressbook))}
  withLabel={false} withIcon={true}
  />

<script lang="ts">
  import type { Addressbook } from "../../logic/Contacts/Addressbook";
  import type { Person } from "../../logic/Abstract/Person";
  import { appGlobal } from "../../logic/app";
  import { selectedWorkspace } from "../MainWindow/Selected";
  import AccountDropDown from "../Shared/AccountDropDown.svelte";
  import { catchErrors } from "../Util/error";

  export let person: Person;

  let selectedAddressbook;
  //$: selectedAddressbook = person?.addressbook;
  $: addressbooks = appGlobal.addressbooks.filter(acc => acc.workspace == $selectedWorkspace || !$selectedWorkspace);

  async function onChangeAddressbook(newAddressbook: Addressbook) {
    console.log("Selected addressbook", newAddressbook?.name, "old", person?.addressbook?.name);
    if (person?.addressbook == newAddressbook || !newAddressbook) {
      return;
    }
    newAddressbook.movePersonHere(person);
  }
</script>
