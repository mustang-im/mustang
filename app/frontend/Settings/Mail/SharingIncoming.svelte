<vbox class="sharing-incoming">
  <HeaderGroupBox>
    <hbox slot="header">{$t`Incoming`} – {$t`Your access to your colleagues' mails`}</hbox>
    <RoundButton
      label={$t`Add`}
      icon={AddIcon}
      onClick={() => showAddDialog = true}
      disabled={showAddDialog}
      slot="buttons-top-right"
      />
    {#if $sharedWith.isEmpty}
      <hbox class="nothing">{$t`You are not accessing other accounts`}</hbox>
    {:else}
      {#each $sharedWith.each as otherAccount}
        <hbox class="existing-person">
          <hbox class="name" flex>{otherAccount.identities.first.realname}</hbox>
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

  {#if showAddDialog}
    <HeaderGroupBox>
      <vbox slot="header">
        <hbox>{$t`Access your colleague's mails`}</hbox>
        <hbox class="subtitle font-small">{$t`Your colleague needs to have granted you access`}</hbox>
      </vbox>
      <RoundButton
        label={$t`Close`}
        icon={CloseIcon}
        onClick={onCloseAddDialog}
        slot="buttons-top-right"
        />
      <vbox>
        <hbox class="person-input">
          <PersonAutocomplete
            placeholder={$t`Mail address of your colleague`}
            onAddPerson={checkForShares}
            {skipPersons} />
          <Button
            label={$t`Add`}
            onClick={() => onAddPerson(sharedPerson)}
            disabled={!sharedPerson || errorMessage}
            classes="primary"
            />
        </hbox>
        {#if errorMessage}
          <StatusMessage message={errorMessage} status="warning" />
        {/if}
      </vbox>
    </HeaderGroupBox>
  {/if}
</vbox>

<script lang="ts">
  import { type Account, getAllAccounts } from "../../../logic/Abstract/Account";
  import { EWSAccount } from "../../../logic/Mail/EWS/EWSAccount";
  import { OWAAccount } from "../../../logic/Mail/OWA/OWAAccount";
  import { PersonUID } from "../../../logic/Abstract/PersonUID";
  import { appName } from "../../../logic/build";
  import PersonAutocomplete from "../../Contacts/PersonAutocomplete/PersonAutocomplete.svelte";
  import HeaderGroupBox from "../../Shared/HeaderGroupBox.svelte";
  import StatusMessage from "../../Setup/Shared/StatusMessage.svelte";
  import RoundButton from "../../Shared/RoundButton.svelte";
  import Button from "../../Shared/Button.svelte";
  import AddIcon from "lucide-svelte/icons/plus";
  import DeleteIcon from "lucide-svelte/icons/trash-2";
  import CloseIcon from "lucide-svelte/icons/x";
  import { assert } from "../../../logic/util/util";
  import { gt, t } from "../../../l10n/l10n";

  export let account: Account;
  $: sharedWith = getAllAccounts().filterObservable(other => other.protocol == account.protocol && other.mainAccount == account);
  $: skipPersons = sharedWith.map(account => new PersonUID(account.username));

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
  let sharedPerson: PersonUID | null = null;
  let sharedFolders: string[] = [];

  function resetAddDialog() {
    errorMessage = null;
    sharedPerson = null;
    sharedFolders = [];
  }

  async function checkForShares(person: PersonUID) {
    try {
      resetAddDialog();
      if (!(account instanceof EWSAccount || account instanceof OWAAccount)) {
        return;
      }
      if (account.dependentAccounts().find(other => other.username == person.emailAddress)) {
        errorMessage = gt`You have already added ${person.name ?? person.emailAddress}`;
        return;
      }
      sharedFolders = await account.findSharedFolders(person, ["msgfolderroot", "inbox", "contacts", "calendar"]);
      if (!sharedFolders.length) {
        errorMessage = gt`You have no access to the account of ${person.name ?? ""} ${person.emailAddress}`;
        return;
      }
      sharedPerson = person;
    } catch (ex) {
      errorMessage = ex.message;
    }
  }

  async function onAddPerson(person: PersonUID) {
    assert(account instanceof EWSAccount || account instanceof OWAAccount, "Not supported");
    sharedPerson = null;
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
</style>
