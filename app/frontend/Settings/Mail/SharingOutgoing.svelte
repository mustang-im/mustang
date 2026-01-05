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
          <PersonAutocomplete
            placeholder={$t`Mail address of your colleague`}
            onAddPerson={checkForShares}
            skipPersons={sharedWith} />
        </hbox>
        {#if addPerson}
          <vbox class="add-person">
            <hbox class="name">{addPerson.name ?? ""}</hbox>
            <hbox class="email-address font-small">{addPerson.emailAddress}</hbox>
          </vbox>
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
              onClick={() => onAddPerson(addPerson)}
              disabled={!addPerson || errorMessage}
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
  import type { IMAPFolder } from "../../../logic/Mail/IMAP/IMAPFolder";
  import { EWSAccount } from "../../../logic/Mail/EWS/EWSAccount";
  import { ExchangePermission } from "../../../logic/Mail/EWS/EWSFolder";
  import { OWAAccount } from "../../../logic/Mail/OWA/OWAAccount";
  import { Addressbook, AddressbookShareCombinedPermissions, addressbookShareCombinedPermissionsLabels } from "../../../logic/Contacts/Addressbook";
  import { Calendar, CalendarShareCombinedPermissions, calendarShareCombinedPermissionsLabels } from "../../../logic/Calendar/Calendar";
  import { MailShareCombinedPermissions, mailShareCombinedPermissionsLabels, MailShareIndividualPermissions, mailShareIndividualPermissionsLabels, type Folder } from "../../../logic/Mail/Folder";
  import { PersonUID } from "../../../logic/Abstract/PersonUID";
  import { getBaseDomainFromHost, getDomainForEmailAddress } from "../../../logic/util/netUtil";
  import { NotReached, NotSupported } from "../../../logic/util/util";
  import { appName } from "../../../logic/build";
  import PersonAutocomplete from "../../Contacts/PersonAutocomplete/PersonAutocomplete.svelte";
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
  $: (async() => { sharedWith = new ArrayColl<PersonUID>(); sharedWith = await account.getSharedPersons(); })();

  async function onDelete(otherPerson: PersonUID) {
    let confirmed = confirm($t`Are you sure that you want to remove all access to your data from the account ${otherPerson.name}?`);
    if (!confirmed) {
      return;
    }

    if (account instanceof IMAPAccount) {
      await onDeletePersonIMAP(otherPerson);
    } else if (account instanceof EWSAccount || account instanceof OWAAccount) {
      await onDeletePersonExchange(otherPerson);
    } else {
      throw new NotSupported();
    }

    sharedWith.remove(otherPerson);
  }

  async function onDeletePersonIMAP(person: PersonUID) {
    for (let folder of account.getAllFolders() as ArrayColl<IMAPFolder>) {
      await folder.removePermission(person);
    }
  }

  async function onDeletePersonExchange(person: PersonUID) {
    let targets: ArrayColl<any> = account.getAllFolders();
    targets.push(calendars.first);
    targets.push(addressbooks.first);
    for (let target of targets) {
      let targetPermissions = await target.getPermissions();
      let personPermission = targetPermissions.find(permission => permission.emailAddress == person.emailAddress);
      if (personPermission) {
        targetPermissions.remove(personPermission);
        await target.setPermissions(targetPermissions);
      }
    }
  }

  let showAddDialog = false;
  let errorMessage: string | null = null;
  let addPerson: PersonUID | null = null;

  function resetAddDialog() {
    errorMessage = null;
    addPerson = null;
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
      addPerson = person;
    } catch (ex) {
      errorMessage = ex.message;
    }
  }

  async function onAddPerson(person: PersonUID) {
    if (account instanceof IMAPAccount) {
      await onAddPersonIMAP(person);
    } else if (account instanceof EWSAccount || account instanceof OWAAccount) {
      await onAddPersonExchange(person);
    } else {
      throw new NotSupported();
    }
    addPerson = null;
  }

  async function onAddPersonIMAP(person: PersonUID) {
    assert(account instanceof IMAPAccount, "Not supported");
    if (shareAllMail || shareMailFolder) {
      let foldersToShare = (shareAllMail ? account.getAllFolders() : includeSubfolders ? mailFolder.getInclusiveDescendants() : new ArrayColl<Folder>([mailFolder])) as ArrayColl<IMAPFolder>;
      let rights = "";
      switch (mailAccess) {
      case MailShareCombinedPermissions.Read:
        rights = "lr";
        break;
      case MailShareCombinedPermissions.FlagChange:
        rights = "lrsw";
        break;
      case MailShareCombinedPermissions.Modify:
        rights = "lrswikxte";
        break;
      case MailShareCombinedPermissions.Custom:
        rights = "l" + (shareRead ? "r" : "") + (shareFlags ? "sw" : "") + (shareDelete ? "te" : "") + (shareCreate ? "i" : "") + (shareDeleteFolder ? "x" : "") + (shareCreateSubfolders ? "k" : "");
        break;
      default:
        throw new NotReached();
      }
      for (let folder of foldersToShare) {
        await folder.addPermission(person, rights);
      }
      sharedWith.add(person);
    }
  }

  async function onAddPersonExchange(person: PersonUID) {
    assert(account instanceof EWSAccount || account instanceof OWAAccount, "Not supported");
    if (shareCalendar) {
      await setExchangePermissions(calendars.first as any, person, calendarAccess);
    }
    if (shareAddressbook) {
      await setExchangePermissions(addressbooks.first as any, person, addressbookAccess);
    }
    if (shareAllMail || shareMailFolder) {
      // XXX Need root folder to share all mail
      let foldersToShare = (shareAllMail ? account.getAllFolders() : includeSubfolders ? mailFolder.getInclusiveDescendants() : new ArrayColl<Folder>([mailFolder]));
      for (let folder of foldersToShare) {
        await setExchangePermissions(folder as any, person, mailAccess);
      }
    }
    sharedWith.add(person);
  }

  async function setExchangePermissions(target: { getPermissions(): Promise<ArrayColl<ExchangePermission>>, setPermissions(permission: ArrayColl<ExchangePermission>): Promise<void> }, person: PersonUID, access: string) {
    let targetPermissions = await target.getPermissions();
    let personPermission = targetPermissions.find(permission => permission.emailAddress == person.emailAddress);
    if (!personPermission) {
      personPermission = new ExchangePermission(person.emailAddress, person.name, { IsFolderVisible: true });
      targetPermissions.add(personPermission);
    }
    let permission = personPermission.exchangePermissions;
    switch (access) {
    case CalendarShareCombinedPermissions.ReadAvailability:
      permission.ReadItems = "TimeOnly";
      break;
    case CalendarShareCombinedPermissions.ReadTitle:
      permission.ReadItems = "TimeAndSubjectAndLocation";
      break;
    case CalendarShareCombinedPermissions.ReadAll:
    case AddressbookShareCombinedPermissions.Read:
    case MailShareCombinedPermissions.Read:
      permission.ReadItems = "FullDetails";
      break;
    case MailShareCombinedPermissions.FlagChange:
      permission.ReadItems = "FullDetails";
      permission.EditItems = "All";
      break;
    case CalendarShareCombinedPermissions.Modify:
    case AddressbookShareCombinedPermissions.Modify:
    case MailShareCombinedPermissions.Modify:
      permission.ReadItems = "FullDetails";
      permission.EditItems = "All";
      permission.DeleteItems = "All";
      permission.CanCreateItems = true;
      break;
    case MailShareCombinedPermissions.Custom:
      permission.ReadItems = shareRead ? "FullDetails" : "None";
      permission.EditItems = shareFlags ? "All" : "None"; // closest supported by Exchange
      permission.DeleteItems = shareDelete ? "All" : "None";
      permission.CanCreateItems = shareCreate;
      permission.IsFolderOwner = shareDeleteFolder; // closest supported by Exchange
      permission.CanCreateSubFolders = shareCreateSubfolders;
      break;
    default:
      throw new NotReached();
    }
    await target.setPermissions(targetPermissions);
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
