<vbox class="sharing-incoming">
  <HeaderGroupBox>
    <hbox slot="header">{$t`Outgoing`} – {$t`People who have access to your mails`}</hbox>
    <RoundButton
      label={$t`Add`}
      icon={AddIcon}
      onClick={() => showAddDialog = true}
      disabled={showAddDialog}
      slot="buttons-top-right"
      />
    {#if $sharedWith.isEmpty}
      <hbox class="nothing">{$t`You have not granted access to anyone`}</hbox>
    {:else}
      {#each $sharedWith.each as otherPerson}
        <hbox class="existing-person">
          <hbox class="name" flex>{otherPerson.name}</hbox>
          <!-- Show access level -->
          <RoundButton
            label={$t`Delete`}
            icon={DeleteIcon}
            onClick={() => onDelete(otherPerson)}
            border={false}
            classes="plain"
            />
        </hbox>
      {/each}
    {/if}
  </HeaderGroupBox>

  {#if showAddDialog && true}
    <HeaderGroupBox>
      <hbox slot="header">{$t`Grant your colleague access to your mails`}</hbox>
      <RoundButton
        label={$t`Close`}
        icon={CloseIcon}
        onClick={onCloseAddDialog}
        slot="buttons-top-right"
        />
      <vbox class="add-dialog">
        <hbox class="person-input">
          <PersonsAutocomplete
            placeholder={$t`Mail address of your colleague`}
            onAddPerson={checkForShares}
            persons={newPersons} />
        </hbox>
        {#if errorMessage}
          <StatusMessage message={errorMessage} status="warning" />
        {/if}

        {#if $newPersons.hasItems}
          <hbox class="mail enable" flex>
            <Checkbox
              label={$t`Share all mail`}
              bind:checked={shareAllMail}
              on:change={() => shareMailFolder = false}
              allowFalse />
            <Checkbox
              label={$t`Share specific mail folders`}
              bind:checked={shareMailFolder}
              on:change={() => shareAllMail = false}
              allowFalse />
          </hbox>
          {#if shareAllMail || shareMailFolder}
            <vbox class="mail checkbox-details">
              {#if shareMailFolder}
                <select bind:value={mailFolder}>
                  {#each account.getAllFolders().each as folder}
                    <option value={folder}>{folder.name}</option>
                  {/each}
                </select>
                <Checkbox
                  label={$t`Include subfolders`}
                  bind:checked={includeSubfolders}
                  classes="subfolders"
                  />
              {/if}
              <hbox>
                <hbox class="label">{$t`Access`}</hbox>
                <select bind:value={mailAccess}>
                  <option value={MailShareCombinedPermissions.Read}>{mailShareCombinedPermissionsLabels[MailShareCombinedPermissions.Read]}</option>
                  <option value={MailShareCombinedPermissions.FlagChange}>{mailShareCombinedPermissionsLabels[MailShareCombinedPermissions.FlagChange]}</option>
                  <option value={MailShareCombinedPermissions.Modify}>{mailShareCombinedPermissionsLabels[MailShareCombinedPermissions.Modify]}</option>
                  <option value={MailShareCombinedPermissions.Custom}>{mailShareCombinedPermissionsLabels[MailShareCombinedPermissions.Custom]}</option>
                </select>
              </hbox>
              {#if mailAccess == MailShareCombinedPermissions.Custom}
                <vbox class="custom-access">
                  <Checkbox bind:checked={shareRead} label={mailShareIndividualPermissionsLabels[MailShareIndividualPermissions.Read]} />
                  <Checkbox bind:checked={shareFlags} label={mailShareIndividualPermissionsLabels[MailShareIndividualPermissions.FlagChange]} />
                  <Checkbox bind:checked={shareDelete} label={mailShareIndividualPermissionsLabels[MailShareIndividualPermissions.Delete]} />
                  <Checkbox bind:checked={shareCreate} label={mailShareIndividualPermissionsLabels[MailShareIndividualPermissions.Create]} />
                  <Checkbox bind:checked={shareDeleteFolder} label={mailShareIndividualPermissionsLabels[MailShareIndividualPermissions.DeleteFolder]} />
                  <Checkbox bind:checked={shareCreateSubfolders} label={mailShareIndividualPermissionsLabels[MailShareIndividualPermissions.CreateSubfolders]} />
                </vbox>
              {/if}
            </vbox>
          {/if}

          <hbox class="enable">
            <Checkbox
              label={$t`Share calendar`}
              bind:checked={shareCalendar}
              allowFalse />
          </hbox>
          {#if shareCalendar}
            <vbox class="checkbox-details">
              <!--
              {#each calendars.each as cal}
                <Checkbox label={cal.name} checked={true} />
              {/each}
              -->
              <hbox class="account-name">{calendars.first?.name}</hbox>
              <hbox>
                <hbox class="label">{$t`Access`}</hbox>
                <select bind:value={calendarAccess}>
                  <option value={CalendarShareCombinedPermissions.ReadAvailability}>{calendarShareCombinedPermissionsLabels[CalendarShareCombinedPermissions.ReadAvailability]}</option>
                  <option value={CalendarShareCombinedPermissions.ReadTitle}>{calendarShareCombinedPermissionsLabels[CalendarShareCombinedPermissions.ReadTitle]}</option>
                  <option value={CalendarShareCombinedPermissions.ReadAll}>{calendarShareCombinedPermissionsLabels[CalendarShareCombinedPermissions.ReadAll]}</option>
                  <option value={CalendarShareCombinedPermissions.Modify}>{calendarShareCombinedPermissionsLabels[CalendarShareCombinedPermissions.Modify]}</option>
                </select>
              </hbox>
            </vbox>
          {/if}

          <hbox class="enable">
            <Checkbox
              label={$t`Share addressbook`}
              bind:checked={shareAddressbook}
              allowFalse />
          </hbox>
          {#if shareAddressbook}
            <vbox class="checkbox-details">
              <!--
              {#each addressbooks.each as ab}
                <Checkbox label={ab.name} checked={true} />
              {/each}
              -->
              <hbox class="account-name">{addressbooks.first?.name}</hbox>
              <hbox>
                <hbox class="label">{$t`Access`}</hbox>
                <select bind:value={addressbookAccess}>
                  <option value={AddressbookShareCombinedPermissions.Read}>{addressbookShareCombinedPermissionsLabels[AddressbookShareCombinedPermissions.Read]}</option>
                  <option value={AddressbookShareCombinedPermissions.Modify}>{addressbookShareCombinedPermissionsLabels[AddressbookShareCombinedPermissions.Modify]}</option>
                </select>
              </hbox>
            </vbox>
          {/if}
          <hbox class="buttons">
            <Button
              label={$t`Add`}
              onClick={() => onAddPersons()}
              disabled={errorMessage}
              classes="primary filled"
              />
          </hbox>
        {/if}

      </vbox>
    </HeaderGroupBox>
  {/if}
</vbox>

<script lang="ts">
  import type { Account } from "../../../logic/Abstract/Account";
  import type { MailAccount } from "../../../logic/Mail/MailAccount";
  import { IMAPAccount } from "../../../logic/Mail/IMAP/IMAPAccount";
  import { EWSAccount } from "../../../logic/Mail/EWS/EWSAccount";
  import { OWAAccount } from "../../../logic/Mail/OWA/OWAAccount";
  import { Addressbook, AddressbookShareCombinedPermissions, addressbookShareCombinedPermissionsLabels } from "../../../logic/Contacts/Addressbook";
  import { Calendar, CalendarShareCombinedPermissions, calendarShareCombinedPermissionsLabels } from "../../../logic/Calendar/Calendar";
  import { MailShareCombinedPermissions, mailShareCombinedPermissionsLabels, MailShareIndividualPermissions, mailShareIndividualPermissionsLabels, type Folder } from "../../../logic/Mail/Folder";
  import { PersonUID } from "../../../logic/Abstract/PersonUID";
  import { getBaseDomainFromHost, getDomainForEmailAddress } from "../../../logic/util/netUtil";
  import { appName } from "../../../logic/build";
  import PersonsAutocomplete from "../../Contacts/PersonAutocomplete/PersonsAutocomplete.svelte";
  import HeaderGroupBox from "../../Shared/HeaderGroupBox.svelte";
  import StatusMessage from "../../Setup/Shared/StatusMessage.svelte";
  import Checkbox from "../../Shared/Checkbox.svelte";
  import RoundButton from "../../Shared/RoundButton.svelte";
  import Button from "../../Shared/Button.svelte";
  import AddIcon from "lucide-svelte/icons/plus";
  import DeleteIcon from "lucide-svelte/icons/trash-2";
  import CloseIcon from "lucide-svelte/icons/x";
  import { assert } from "../../../logic/util/util";
  import { gt, t } from "../../../l10n/l10n";
  import { ArrayColl, Collection } from "svelte-collections";

  export let account: MailAccount;
  let sharedWith = new ArrayColl<PersonUID>();
  $: (async() => { sharedWith = new ArrayColl<PersonUID>(); findSharedPersons(account); })();

  async function findSharedPersons(account: MailAccount) {
    mergePersons(await account.getSharedPersons());
    mergePersons(await calendars.first?.getSharedPersons());
    mergePersons(await addressbooks.first?.getSharedPersons());
  }

  async function mergePersons(persons?: ArrayColl<PersonUID>) {
    for (let person of persons) {
      if (!sharedWith.some(otherPerson => otherPerson.emailAddress == person.emailAddress)) {
        sharedWith.add(person);
      }
    }
  }

  async function onDelete(otherPerson: PersonUID) {
    let confirmed = confirm($t`Are you sure that you want to remove all access to your data from the account ${otherPerson.name}?`);
    if (!confirmed) {
      return;
    }
    await account.deleteSharedPerson(otherPerson);
    await calendars.first?.deleteSharedPerson(otherPerson);
    await addressbooks.first?.deleteSharedPerson(otherPerson);
    sharedWith.remove(otherPerson);
  }

  let showAddDialog = false;
  let errorMessage: string | null = null;
  let newPersons = new ArrayColl<PersonUID>();

  function resetAddDialog() {
    errorMessage = null;
    newPersons.clear();
  }

  async function checkForShares(person: PersonUID) {
    try {
      resetAddDialog();
      if (!(account instanceof EWSAccount || account instanceof OWAAccount || account instanceof IMAPAccount)) {
        return;
      }
      if (getBaseDomainFromHost(getDomainForEmailAddress(person.emailAddress)) !=
          getBaseDomainFromHost(getDomainForEmailAddress(account.emailAddress))) {
        errorMessage = gt`You can only share with users in your company`;
        return;
      }
      newPersons.add(person);
    } catch (ex) {
      errorMessage = ex.message;
    }
  }

  async function onAddPersons() {
    for (let person of newPersons) {
      await account.addSharedPerson(person, { shareAllMail, shareMailFolder, mailAccess, shareCalendar, calendarAccess, shareAddressbook, addressbookAccess, mailFolder, includeSubfolders, shareRead, shareFlags, shareDelete, shareCreate, shareDeleteFolder, shareCreateSubfolders });
      sharedWith.add(person);
    }
    newPersons.clear();
  }

  function onCloseAddDialog() {
    showAddDialog = false;
    resetAddDialog();
  }

  let shareAllMail = true;
  let shareMailFolder = false;
  let shareAddressbook = false;
  let shareCalendar = true;
  // mail
  let mailAccess = MailShareCombinedPermissions.Read;
  let mailFolder = account.inbox;
  let selectedFolders: ArrayColl<Folder>;
  let includeSubfolders = true;
  let shareRead = true;
  let shareFlags = false;
  let shareDelete = false;
  let shareCreate = false;
  let shareDeleteFolder = false;
  let shareCreateSubfolders = false;
  // calendars and addressbooks
  $: calendars = account.dependentAccounts().filterObservable(acc => acc instanceof Calendar);
  $: addressbooks = account.dependentAccounts().filterObservable(acc => acc instanceof Addressbook);
  let calendarAccess = CalendarShareCombinedPermissions.ReadAvailability;
  let addressbookAccess = AddressbookShareCombinedPermissions.Read;
</script>

<style>
  .sharing-incoming {
    max-width: 40em;
  }
  .header {
    align-items: center;
  }
  .subtitle {
    font-weight: normal;
  }
  .nothing {
    opacity: 50%;
  }
  .person-input {
    margin-block-end: 8px;
  }
  .add-person .name {
    margin-block-start: 32px;
  }
  .add-person .email-address {
    opacity: 70%;
  }
  .enable {
    margin-block: 32px 16px;
  }
  .mail.enable > :global(*) {
    flex: 1 0 0;
  }
  .checkbox-details {
    margin-inline-start: 29px; /* Width of `<Checkbox>` without label */
  }
  .account-name {
    margin-block-end: 12px;
  }
  .label {
    margin-inline-end: 12px;
  }
  .mail :global(.subfolders) {
    margin-block: 12px;
  }
  .buttons {
    align-items: center;
    justify-content: end;
  }
</style>
