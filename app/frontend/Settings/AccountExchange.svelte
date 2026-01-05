<HeaderGroupBox>
  <hbox slot="header">Exchange - {$t`Advanced`}</hbox>

  {#if permissions}
    <hbox class="align-start">
      <label for="permissions">{label}</label>
      <PersonsAutocomplete persons={permissions} placeholder={$t`Add permisson`} {onAddPerson} {onRemovePerson}>
        <hbox slot="result-bottom-row" class="recipient-email-address font-small" let:person>
          {person.emailAddress}
        </hbox>
        <slot name="person-popup-bottom" slot="person-popup-bottom" let:person {person}/>
      </PersonsAutocomplete>
      <Button label={$t`Save Permissions`} onClick={onSavePermissions}/>
    </hbox>
  {/if}

</HeaderGroupBox>

<script lang="ts">
  import type { PersonUID } from "../../logic/Abstract/PersonUID";
  import { ExchangePermission } from "../../logic/Mail/EWS/EWSFolder";
  import type { EWSAddressbook } from "../../logic/Contacts/EWS/EWSAddressbook";
  import type { EWSCalendar } from "../../logic/Calendar/EWS/EWSCalendar";
  import type { OWAAddressbook } from "../../logic/Contacts/OWA/OWAAddressbook";
  import type { OWACalendar } from "../../logic/Calendar/OWA/OWACalendar";
  import Button from "../Shared/Button.svelte";
  import HeaderGroupBox from "../Shared/HeaderGroupBox.svelte";
  import PersonsAutocomplete from "../Contacts/PersonAutocomplete/PersonsAutocomplete.svelte";
  import { showError } from '../Util/error';
  import { t } from "../../l10n/l10n";
  import type { ArrayColl } from "svelte-collections";

  export let label: string;
  export let account: EWSAddressbook | EWSCalendar | OWAAddressbook | OWACalendar;
  let previousAccount: EWSAddressbook | EWSCalendar | OWAAddressbook | OWACalendar;
  let permissions: ArrayColl<ExchangePermission> | undefined;

  $: getPermissions(account);

  async function getPermissions(account: EWSAddressbook | EWSCalendar | OWAAddressbook | OWACalendar) {
    if (account == previousAccount) {
      return;
    }
    previousAccount = account;
    permissions = undefined;
    try {
      permissions = await account.getPermissions();
    } catch (ex) {
      showError(ex);
    }
  }

  function onAddPerson(person: PersonUID) {
    permissions.add(new ExchangePermission(person.emailAddress, person.name));
  }

  function onRemovePerson(person: ExchangePermission) {
    if (!person.emailAddress.startsWith("*@")) {
      permissions.remove(person);
    }
  }

  async function onSavePermissions() {
    await account.setPermissions(permissions);
  }
</script>

<style>
  .align-start {
    align-items: flex-start;
  }
</style>
