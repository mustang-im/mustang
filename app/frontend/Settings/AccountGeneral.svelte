<vbox class="account-general">
  <HeaderGroupBox>
    <hbox slot="header">{$account.name}</hbox>
    <svelte:fragment slot="buttons-top-right">
      <RoundButton
        label={$t`Delete account`}
        onClick={onDelete}
        icon={DeleteIcon}
        />
    </svelte:fragment>
    <vbox class="content">
      <grid>
        <label for="name">{$t`Account name`}</label>
        <input type="text" bind:value={account.name} name="name" on:change={onChange} />
        <input type="color" bind:value={account.color} name="color" on:change={onChange} list="proposed-colors" />
        {#if account.icon && typeof(account.icon) == "string"}
          <img src={account.icon} width="24px" height="24px" alt="" />
        {:else}
          <hbox class="icon placeholder" />
        {/if}

        <label for="workspace">{$t`Workspace`}</label>
        <select bind:value={account.workspace} name="workspace">
          {#each appGlobal.workspaces.each as workspace}
            <option value={workspace}>{workspace.name}</option>
          {/each}
        </select>
        <hbox />
        <hbox />

        {#if account instanceof MailAccount || account instanceof ChatAccount || account instanceof MeetAccount}
          <label for="realname" title={$t`Your real name, as shown to other people when you are sending messages`}>{$t`Your name`}</label>
          <input type="text" bind:value={account.realname} name="realname" on:change={onChange}
            title={$t`Your real name, as shown to other people when you are sending messages`} />
          <hbox />
          <hbox />
        {/if}
      </grid>
    </vbox>
  </HeaderGroupBox>

  {#if account instanceof EWSAccount && !account.mainAccount}
    <HeaderGroupBox>
      <hbox slot="header">EWS {$t`Folders - Sharing`}</hbox>
      {#each sharedAccounts.contents as mailAccount}
        <hbox>{mailAccount.name}</hbox>
      {:else}
        <hbox>{$t`No shared folders.`}</hbox>
      {/each}
      <hbox>
        <PersonAutocomplete {skipPersons} placeholder={$t`Add shared folders`} onAddPerson={checkForShares}/>
        <Button disabled={shareAccountDisabled} label={$t`Add shared account`} on:click={() => onAddSharedFolders(sharedPerson, "msgfolderroot")}/>
        <Button disabled={shareInboxDisabled} label={$t`Add shared inbox`} on:click={() => onAddSharedFolders(sharedPerson, "inbox")}/>
        <Button disabled={shareAddressbookDisabled} label={$t`Add shared addressbook`} on:click={() => onAddAddressbook(sharedPerson)}/>
        <Button disabled={shareCalendarDisabled} label={$t`Add shared calendar`} on:click={() => onAddCalendar(sharedPerson)}/>
      </hbox>
    </HeaderGroupBox>
  {/if}

  {#if account instanceof EWSAddressbook && account.username == account.mainAccount.username}
    <HeaderGroupBox>
      <hbox slot="header">EWS {$t`Addressbook - Sharing`}</hbox>
      {#each sharedAccounts.contents as addressbook}
        <hbox>{addressbook.name}</hbox>
      {:else}
        <hbox>{$t`No shared addressbooks.`}</hbox>
      {/each}
      <hbox>
        <PersonAutocomplete {skipPersons} placeholder={$t`Add shared addressbook`} onAddPerson={onAddAddressbook}/>
      </hbox>
    </HeaderGroupBox>
  {/if}

  {#if account instanceof EWSCalendar && account.username == account.mainAccount.username}
    <HeaderGroupBox>
      <hbox slot="header">EWS {$t`Calendar - Sharing`}</hbox>
      {#each sharedAccounts.contents as calendar}
        <hbox>{calendar.name}</hbox>
      {:else}
        <hbox>{$t`No shared calendars.`}</hbox>
      {/each}
      <hbox>
        <PersonAutocomplete {skipPersons} placeholder={$t`Add shared calendar`} onAddPerson={onAddCalendar}/>
      </hbox>
    </HeaderGroupBox>
  {/if}
</vbox>

<!-- <copied to="WorkspaceBlock.svelte" /> -->
<datalist id="proposed-colors">
  {#each accountColors as color}
    <option value={color}></option>
  {/each}
</datalist>

<script lang="ts">
  import { type Account, getAllAccounts } from "../../logic/Abstract/Account";
  import { selectedAccount, selectedFolder, selectedMessage, selectedMessages } from "../Mail/Selected";
  import { accountColors } from "../../logic/Abstract/Workspace";
  import { MailAccount } from "../../logic/Mail/MailAccount";
  import { ChatAccount } from "../../logic/Chat/ChatAccount";
  import { MeetAccount } from "../../logic/Meet/MeetAccount";
  import { EWSAccount } from "../../logic/Mail/EWS/EWSAccount";
  import { EWSAddressbook } from "../../logic/Contacts/EWS/EWSAddressbook";
  import { EWSCalendar } from "../../logic/Calendar/EWS/EWSCalendar";
  import { PersonUID } from "../../logic/Abstract/PersonUID";
  import { appGlobal } from "../../logic/app";
  import { appName } from "../../logic/build";
  import { catchErrors, showError } from "../Util/error";
  import PersonAutocomplete from "../Contacts/PersonAutocomplete/PersonAutocomplete.svelte";
  import HeaderGroupBox from "../Shared/HeaderGroupBox.svelte";
  import RoundButton from "../Shared/RoundButton.svelte";
  import Button from "../Shared/Button.svelte";
  import DeleteIcon from "lucide-svelte/icons/trash-2";
  import { useDebounce } from '@svelteuidev/composables';
  import { t } from "../../l10n/l10n";

  export let account: Account;
  $: sharedAccounts = getAllAccounts().filter(other => other.protocol == account.protocol && other.mainAccount == (account.mainAccount || account) && other.username != account.username);
  $: skipPersons = sharedAccounts.map(account => new PersonUID(account.username));
  let sharedPerson: PersonUID = null;
  let shareAccountDisabled: boolean | string = false;
  let shareInboxDisabled: boolean | string = false;
  let shareAddressbookDisabled: boolean | string = false;
  let shareCalendarDisabled: boolean | string = false;
  $: account, (sharedPerson = null), (shareAccountDisabled = shareInboxDisabled = shareAddressbookDisabled = shareCalendarDisabled = $t`Please enter the email address of the shared account`);

  const onChange = useDebounce(() => catchErrors(onSave), 500);
  async function onSave() {
    await account.save();
  }

  async function onDelete() {
    let confirmed = confirm($t`Are you sure that you want to the delete account ${account.name} from ${appName} and all related data?`);
    if (!confirmed) {
      return;
    }
    await account.deleteIt();

    // Reset selected
    if ($selectedAccount == account) {
      $selectedAccount = appGlobal.emailAccounts.first;
      $selectedFolder = $selectedAccount?.inbox;
      $selectedMessage = null;
      $selectedMessages.clear();
    }
  }

  async function checkForShares(person: PersonUID) {
    sharedPerson = person;
    let shares = await (account as EWSAccount).findNamedFolders(sharedPerson, ["msgfolderroot", "inbox", "contacts", "calendar"]);
    if (!shares.includes("msgfolderroot")) {
      shareAccountDisabled = await $t`The root folder is inaccessible`;
    } else if (account.dependentAccounts().find(other => other.protocol == 'ews' && other.username == sharedPerson.emailAddress)) {
      shareAccountDisabled = await $t`This account has already been shared`;
    } else {
      shareAccountDisabled = false;
    }
    if (!shares.includes("inbox")) {
      shareInboxDisabled = await $t`The inbox is inaccessible`;
    } else if (account.dependentAccounts().find(other => other.protocol == 'ews' && other.username == sharedPerson.emailAddress)) {
      shareInboxDisabled = await $t`This inbox has already been shared`;
    } else {
      shareInboxDisabled = false;
    }
    if (!shares.includes("contacts")) {
      shareAddressbookDisabled = await $t`The addressbook is inaccessible`;
    } else if (account.dependentAccounts().find(other => other.protocol == 'addressbook-ews' && other.username == sharedPerson.emailAddress)) {
      shareAddressbookDisabled = await $t`This addressbook has already been shared`;
    } else {
      shareAddressbookDisabled = false;
    }
    if (!shares.includes("calendar")) {
      shareCalendarDisabled = await $t`The calendar is inaccessible`;
    } else if (account.dependentAccounts().find(other => other.protocol == 'calendar-ews' && other.username == sharedPerson.emailAddress)) {
      shareCalendarDisabled = await $t`This calendar has already been shared`;
    } else {
      shareCalendarDisabled = false;
    }
  }

  async function onAddSharedFolders(person: PersonUID, sharedFolderRoot: "msgfolderroot" | "inbox") {
    try {
      await (account as EWSAccount).addSharedFolders(person, sharedFolderRoot);
      shareAccountDisabled = shareInboxDisabled = sharedFolderRoot == "inbox"
        ? await $t`This inbox has already been shared`
        : await $t`This account has already been shared`;
    } catch (ex) {
      showError(ex);
    }
  }

  async function onAddAddressbook(person: PersonUID) {
    try {
      let mainAccount = (account.mainAccount || account) as EWSAccount;
      await mainAccount.addSharedAddressbook(person);
      shareAddressbookDisabled = await $t`This addressbook has already been shared`;
    } catch (ex) {
      showError(ex);
    }
  }

  async function onAddCalendar(person: PersonUID) {
    try {
      let mainAccount = (account.mainAccount || account) as EWSAccount;
      await mainAccount.addSharedCalendar(person);
      shareCalendarDisabled = await $t`This calendar has already been shared`;
    } catch (ex) {
      showError(ex);
    }
  }
</script>

<style>
  .account-general {
    max-width: 40em;
  }

  grid {
    grid-template-columns: max-content auto max-content max-content;
    gap: 8px 24px;
  }

  .icon.placeholder {
    width: 24px;
    height: 24px;
  }

  input[name] {
    margin-block-end: 24px;
  }
</style>
