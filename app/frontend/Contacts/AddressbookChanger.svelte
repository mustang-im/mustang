<AccountDropDown
  bind:selectedAccount={selectedAddressbook}
  accounts={addressbooks}
  filterByWorkspace={false}
  icon={selectedAddressbook?.icon ?? AddressbookIcon}
  {withLabel}
  on:select={() => catchErrors(() => onChangeAddressbook(selectedAddressbook))}
  />

<script lang="ts">
  import type { Addressbook } from "../../logic/Contacts/Addressbook";
  import type { Person } from "../../logic/Abstract/Person";
  import { appGlobal } from "../../logic/app";
  import { selectedWorkspace } from "../MainWindow/Selected";
  import AccountDropDown from "../Shared/AccountDropDown.svelte";
  import AddressbookIcon from "lucide-svelte/icons/book-user";
  import { catchErrors } from "../Util/error";

  export let person: Person;
  export let withLabel = false;

  let selectedAddressbook = person?.addressbook;
  $: addressbooks = appGlobal.addressbooks.filter(acc => acc.workspace == $selectedWorkspace || !$selectedWorkspace);

  async function onChangeAddressbook(newAddressbook: Addressbook) {
    console.log("Selected addressbook", newAddressbook?.name, "old", person?.addressbook?.name);
    person.moveToAddressbook(newAddressbook);
  }
</script>
