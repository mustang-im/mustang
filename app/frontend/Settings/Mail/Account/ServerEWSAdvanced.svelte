<HeaderGroupBox>
  <hbox slot="header">EWS - {$t`Advanced`}</hbox>

  {#if delegates}
    <hbox>
      <PersonsAutocomplete persons={delegates} placeholder={$t`Add delegate`} {onAddPerson} {onRemovePerson}>
        <hbox slot="result-bottom-row" class="recipient-email-address font-small" let:person>
          {person.emailAddress}
        </hbox>
        <ServerEWSPermissions slot="person-popup-bottom" let:person {person}/>
        <hbox slot="person-popup-buttons" let:person>
          <Button plain label={$t`Save`} onClick={() => onSave(person)}/>
        </hbox>
      </PersonsAutocomplete>
    </hbox>
  {/if}

</HeaderGroupBox>

<script lang="ts">
  import type { PersonUID } from "../../../../logic/Abstract/PersonUID";
  import { Delegate, type EWSAccount } from "../../../../logic/Mail/EWS/EWSAccount";
  import Button from "../../../Shared/Button.svelte";
  import HeaderGroupBox from "../../../Shared/HeaderGroupBox.svelte";
  import PersonsAutocomplete from "../../../Contacts/PersonAutocomplete/PersonsAutocomplete.svelte";
  import ServerEWSPermissions from "./ServerEWSPermissions.svelte";
  import { showError } from '../../../Util/error';
  import { t } from "../../../../l10n/l10n";
  import type { ArrayColl } from "svelte-collections";

  export let account: EWSAccount;
  let previousAccount: EWSAccount;
  let delegates: ArrayColl<Delegate> | undefined;

  $: getDelegates(account);

  async function getDelegates(account: EWSAccount) {
    if (account == previousAccount) {
      return;
    }
    previousAccount = account;
    try {
      delegates = await account.getDelegates();
    } catch (ex) {
      showError(ex);
    }
  }

  async function onSave(person: PersonUID) {
    try {
      await account.writeDelegate(person as Delegate);
    } catch (ex) {
      showError(ex);
    }
  }

  function onAddPerson(person: PersonUID) {
    delegates.add(new Delegate(person.emailAddress, person.name));
  }

  async function onRemovePerson(person: Delegate) {
    if (!person.isNew) {
      if (!confirm("Are you sure you want to remove this delegation?")) {
        return;
      }
      try {
        await account.removeDelegate(person.emailAddress);
      } catch (ex) {
        showError(ex);
      }
    }
    delegates.remove(person);
  }
</script>
