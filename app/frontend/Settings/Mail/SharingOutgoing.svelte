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
      {#each $sharedWith.each as otherAccount}
        <hbox class="existing-person">
          <hbox class="name" flex>{otherAccount.name}</hbox>
          <!-- Show access level -->
          <RoundButton
            label={$t`Delete`}
            icon={DeleteIcon}
            onClick={() => onDelete(otherAccount)}
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
      <vbox>
        <hbox class="person-input">
          <PersonsAutocomplete
            placeholder={$t`Mail address of your colleague`}
            onAddPerson={checkForShares}
            persons={newPersons} />
        </hbox>
        {#if addPerson}
          <hbox class="name">{addPerson.name ?? ""}</hbox>
          <hbox class="email-address font-small">{addPerson.emailAddress}</hbox>
        {/if}
        {#if errorMessage}
          <StatusMessage message={errorMessage} status="warning" />
        {/if}

        {#if addPerson}
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
                  <Checkbox label={$t`Read mail`} checked={true} />
                  <Checkbox label={$t`Change mail flags`} checked={false} />
                  <Checkbox label={$t`Delete mails`} checked={false} />
                  <Checkbox label={$t`Add new mails`} checked={false} />
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
              <select bind:value={mailAccess}>
                <option value={MailShareCombinedPermissions.Read}>{mailShareCombinedPermissionsLabels[MailShareCombinedPermissions.Read]}</option>
                <option value={MailShareCombinedPermissions.FlagChange}>{mailShareCombinedPermissionsLabels[MailShareCombinedPermissions.FlagChange]}</option>
                <option value={MailShareCombinedPermissions.Modify}>{mailShareCombinedPermissionsLabels[MailShareCombinedPermissions.Modify]}</option>
                <option value={MailShareCombinedPermissions.Custom}>{mailShareCombinedPermissionsLabels[MailShareCombinedPermissions.Custom]}</option>
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
              <select bind:value={mailAccess}>
                <option value={MailShareCombinedPermissions.Read}>{mailShareCombinedPermissionsLabels[MailShareCombinedPermissions.Read]}</option>
                <option value={MailShareCombinedPermissions.FlagChange}>{mailShareCombinedPermissionsLabels[MailShareCombinedPermissions.FlagChange]}</option>
                <option value={MailShareCombinedPermissions.Modify}>{mailShareCombinedPermissionsLabels[MailShareCombinedPermissions.Modify]}</option>
                <option value={MailShareCombinedPermissions.Custom}>{mailShareCombinedPermissionsLabels[MailShareCombinedPermissions.Custom]}</option>
              </select>
            </hbox>
          </vbox>
        {/if}
        <hbox class="buttons">
          <Button
            label={$t`Add`}
            onClick={() => onAddPerson(addPerson)}
            disabled={!addPerson || errorMessage}
            classes="primary filled"
            />
        </hbox>
      {/if}

    </HeaderGroupBox>
  {/if}
</vbox>

<script lang="ts">
  import type { Account } from "../../../logic/Abstract/Account";
  import type { MailAccount } from "../../../logic/Mail/MailAccount";
  import { IMAPAccount } from "../../../logic/Mail/IMAP/IMAPAccount";
  import { EWSAccount } from "../../../logic/Mail/EWS/EWSAccount";
  import { OWAAccount } from "../../../logic/Mail/OWA/OWAAccount";
  import { Addressbook } from "../../../logic/Contacts/Addressbook";
  import { Calendar } from "../../../logic/Calendar/Calendar";
  import type { Folder } from "../../../logic/Mail/Folder";
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
  $: sharedWith = account.dependentAccounts().filterObservable(dep => dep.protocol == account.protocol);
  $: skipPersons = sharedWith.map(account => new PersonUID(account.username));
  let newPersons = new ArrayColl<PersonUID>();

  async function onDelete(otherAccount: Account) {
    let confirmed = confirm($t`Are you sure that you want to delete the account ${otherAccount.name} and all related data from ${appName}?`);
    if (!confirmed) {
      return;
    }
    await otherAccount.deleteIt();
    sharedWith.remove(otherAccount);
  }

  let showAddDialog = false;
  let errorMessage: string | null = null;
  let addPerson: PersonUID | null = null;
  let sharedFolders: string[] = [];

  function resetAddDialog() {
    errorMessage = null;
    addPerson = null;
    sharedFolders = [];
  }

  async function checkForShares(person: PersonUID) {
    try {
      resetAddDialog();
      if (!(account instanceof EWSAccount || account instanceof OWAAccount || IMAPAccount)) {
        return;
      }
      if (getBaseDomainFromHost(getDomainForEmailAddress(person.emailAddress)) !=
          getBaseDomainFromHost(getDomainForEmailAddress(account.emailAddress))) {
        errorMessage = gt`You can only share with users in your company`;
        return;
      }
      addPerson = person;
    } catch (ex) {
      errorMessage = ex.message;
    }
  }

  async function onAddPerson(person: PersonUID) {
    assert(account instanceof EWSAccount || account instanceof OWAAccount, "Not supported");
    addPerson = null;
    if (sharedFolders.includes("msgfolderroot")) {
      await account.addSharedFolders(person, "msgfolderroot");
    } else if (sharedFolders.includes("inbox")) {
      await account.addSharedFolders(person, "inbox");
    }
    if (sharedFolders.includes("contacts")) {
      await account.addSharedAddressbook(person);
    }
    if (sharedFolders.includes("calendar")) {
      await account.addSharedCalendar(person);
    }
  }

  function onCloseAddDialog() {
    showAddDialog = false;
    resetAddDialog();
  }

  enum MailShareCombinedPermissions {
    Read = "read",
    /** Can read messages, and change the flags and tags,
     * but not add and delete emails */
    FlagChange = "flags-change",
    /** Full access, read, add and delete emails, and flag changes */
    Modify = "modify",
    Custom = "custom",
  }
  const mailShareCombinedPermissionsLabels: Record<string, string> = {
    [MailShareCombinedPermissions.Read]: gt`Read`,
    [MailShareCombinedPermissions.FlagChange]: gt`Tag, star, mark as read`,
    [MailShareCombinedPermissions.Modify]: gt`Delete, move and add mails`,
    [MailShareCombinedPermissions.Custom]: gt`Custom`,
  };
  enum MailShareIndividualPermissions {
  }

  enum CalendarShareCombinedPermissions {
    /** Can see whether the user is busy or not, but not the title nor details of the meeting */
    ReadAvailability = "read-busy",
    /** Can see the times and titles of the meeting, but nothing else */
    ReadTitle = "read-title",
    /** Can see all details of all meetings */
    ReadAll = "read-all",
    /** Full access: Modify meeting details, and add and delete meetings */
    Modify = "modify",
  }
  const calendarShareCombinedPermissionsLabels: Record<string, string> = {
    [CalendarShareCombinedPermissions.ReadAvailability]: gt`See availability only`,
    [CalendarShareCombinedPermissions.ReadTitle]: gt`See titles only`,
    [CalendarShareCombinedPermissions.ReadAll]: gt`See all meetings with details`,
    [CalendarShareCombinedPermissions.Modify]: gt`Modify, add and delete meetings`,
  };

  enum AddressbookShareCombinedPermissions {
    /** Can see all contacts details, but not modify */
    Read = "read",
    /** Can see and modify all details of all contacts, and add and delete contacts */
    Modify = "modify",
  }
  const addressbookShareCombinedPermissionsLabels: Record<string, string> = {
    [AddressbookShareCombinedPermissions.Read]: gt`See all contact details`,
    [AddressbookShareCombinedPermissions.Modify]: gt`Modify, add and delete contacts`,
  };

  let shareAllMail = true;
  let shareMailFolder = false;
  let shareAddressbook = false;
  let shareCalendar = true;
  // mail
  let mailAccess = MailShareCombinedPermissions.Read;
  let mailFolder = account.inbox;
  let selectedFolders: ArrayColl<Folder>;
  let includeSubfolders = true;
  // calendars and addressbooks
  $: calendars = (showAddDialog ? account.dependentAccounts().filterObservable(acc => acc instanceof Calendar) : new ArrayColl()) as Collection<Calendar>;
  $: addressbooks = (showAddDialog ? account.dependentAccounts().filterObservable(acc => acc instanceof Addressbook) : new ArrayColl()) as Collection<Addressbook>;
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
  .name {
    margin-block-start: 32px;
  }
  .email-address {
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
