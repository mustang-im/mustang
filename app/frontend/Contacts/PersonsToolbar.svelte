<hbox class="persons-toolbar">
  <vbox class="scroll">
    <AccountDropDown
      bind:selectedAccount={selectedAddressbook}
      accounts={appGlobal.addressbooks}
      showAllOption={true}
      filterByWorkspace={true}
      />
  </vbox>
  <hbox flex />
  <hbox class="buttons">
    <RoundButton
      label={$t`Sync from server`}
      icon={SyncIcon}
      iconSize="12px" padding="4px" classes="sync small" border={false}
      onClick={sync}
      disabled={!$selectedAddressbook?.canSync}
      />
    <RoundButton
      label={$t`New contact`}
      icon={NewContactIcon}
      iconSize="22px" padding="9px" classes="large create"
      onClick={addPerson}
      disabled={!$selectedAddressbook}
      />
  </hbox>
</hbox>

<script lang="ts">
  import type { Person } from "../../logic/Abstract/Person";
  import { selectedPerson } from "./Person/Selected";
  import type { Addressbook } from "../../logic/Contacts/Addressbook";
  import { appGlobal } from "../../logic/app";
  import AccountDropDown from "../Shared/AccountDropDown.svelte";
  import RoundButton from "../Shared/RoundButton.svelte";
  import NewContactIcon from "lucide-svelte/icons/plus";
  import SyncIcon from "lucide-svelte/icons/refresh-cw";
  import { assert } from "../../logic/util/util";
  import type { Collection } from "svelte-collections";
  import { t } from "../../l10n/l10n";

  /** in */
  export let persons: Collection<Person>;
  /** in/out */
  export let selectedAddressbook: Addressbook;

  function addPerson() {
    //assert(persons instanceof ArrayColl, "Please exit the search before adding a person");
    let person = selectedAddressbook.newPerson();
    person.name = "";
    persons.add(person);
    $selectedPerson = person;
  }

  async function sync() {
    assert($selectedAddressbook?.canSync, "Cannot sync " + $selectedAddressbook.protocol);
    await $selectedAddressbook.listContacts();
  }
</script>

<style>
  .persons-toolbar {
    margin: 10px 12px 10px 16px;
    align-items: end;
  }
  .buttons {
    align-items: end;
  }
  .buttons :global(.button) {
    margin-left: 6px;
  }
  .buttons :global(.button.disabled) {
    opacity: 10%;
  }
</style>
