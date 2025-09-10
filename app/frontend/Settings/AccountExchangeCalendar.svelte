<HeaderGroupBox>
  <hbox slot="header">Exchange - {$t`Advanced`}</hbox>

  {#if permissions}
    <hbox class="align-start">
      <label for="permissions">{$t`Calendar permissions`}</label>
      <PersonsAutocomplete persons={permissions} placeholder={$t`Add permisson`} {onAddPerson} {onRemovePerson}>
        <hbox slot="result-bottom-row" class="recipient-email-address font-small" let:person>
          {person.emailAddress}
        </hbox>
        <CalendarExchangePermissions slot="person-popup-bottom" let:person {person}/>
      </PersonsAutocomplete>
      <Button label={$t`Save Permissions`} onClick={onSavePermissions}/>
    </hbox>
  {/if}

</HeaderGroupBox>

<script lang="ts">
  import type { PersonUID } from "../../logic/Abstract/PersonUID";
  import { ExchangePermission } from "../../logic/Mail/EWS/EWSFolder";
  import type { EWSCalendar } from "../../logic/Calendar/EWS/EWSCalendar";
  import type { OWACalendar } from "../../logic/Calendar/OWA/OWACalendar";
  import Button from "../Shared/Button.svelte";
  import HeaderGroupBox from "../Shared/HeaderGroupBox.svelte";
  import PersonsAutocomplete from "../Contacts/PersonAutocomplete/PersonsAutocomplete.svelte";
  import CalendarExchangePermissions from "./CalendarExchangePermissions.svelte";
  import { showError } from '../Util/error';
  import { t } from "../../l10n/l10n";
  import type { ArrayColl } from "svelte-collections";

  export let account: EWSCalendar | OWACalendar;
  let previousAccount: EWSCalendar | OWACalendar;
  let permissions: ArrayColl<ExchangePermission> | undefined;

  $: getPermissions(account);

  async function getPermissions(account: EWSCalendar | OWACalendar) {
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
