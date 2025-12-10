<vbox class="sharing-outgoing">
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
      {#each $sharedWith.each as otherUser}
        <hbox class="existing-person">
          <hbox class="name" flex>{otherUser.name}</hbox>
          <!-- Show access level -->
          <RoundButton
            label={$t`Delete`}
            icon={DeleteIcon}
            onClick={() => onDelete(otherUser)}
            border={false}
            classes="plain"
            />
        </hbox>
      {/each}
    {/if}
  </HeaderGroupBox>

  {#if showAddDialog}
    <HeaderGroupBox>
      <hbox slot="header">{$t`Grant your colleague access to your mails`}</hbox>
      <RoundButton
        label={$t`Close`}
        icon={CloseIcon}
        onClick={() => showAddDialog = false}
        slot="buttons-top-right"
        />
      <hbox>
        <PersonAutocomplete
          onAddPerson={checkForShares}
          placeholder={$t`Mail address of your colleague`}
          {skipPersons} />
        <Button
          label={$t`Add`}
          onClick={() => onAddPerson(sharedPerson)}
          disabled={!sharedPerson || errorMessage}
          classes="primary"
          />
        {#if errorMessage}
          {errorMessage}
        {/if}
      </hbox>
    </HeaderGroupBox>
  {/if}
</vbox>

<script lang="ts">
  import { type Account, getAllAccounts } from "../../../logic/Abstract/Account";
  import { EWSAccount } from "../../../logic/Mail/EWS/EWSAccount";
  import { PersonUID } from "../../../logic/Abstract/PersonUID";
  import PersonAutocomplete from "../../Contacts/PersonAutocomplete/PersonAutocomplete.svelte";
  import HeaderGroupBox from "../../Shared/HeaderGroupBox.svelte";
  import RoundButton from "../../Shared/RoundButton.svelte";
  import Button from "../../Shared/Button.svelte";
  import AddIcon from "lucide-svelte/icons/plus";
  import DeleteIcon from "lucide-svelte/icons/trash-2";
  import CloseIcon from "lucide-svelte/icons/x";
  import { assert } from "../../../logic/util/util";
  import { gt, t } from "../../../l10n/l10n";
  import { ArrayColl } from "svelte-collections";

  export let account: Account;
  $: sharedAccounts = getAllAccounts().filterObservable(other => other.protocol == account.protocol && other.mainAccount == (account.mainAccount || account) && other.username != account.username);
  $: skipPersons = sharedAccounts.map(account => new PersonUID(account.username));
  let sharedWith = new ArrayColl<PersonUID>();

  sharedWith.add(new PersonUID("1@example.com", "Test User 1"));
  sharedWith.add(new PersonUID("2@example.com", "Test User 2"));
  sharedWith.add(new PersonUID("3@example.com", "Test User 3"));

  async function onDelete(otherUser: PersonUID) {
    let confirmed = confirm($t`Are you sure that you want to the remove ${otherUser.name} from having access to your account?`);
    if (!confirmed) {
      return;
    }
    // sharedWith.remove(otherUser);
    // await server call
  }

  let showAddDialog = false;
  let errorMessage: string | null = null;
  let sharedPerson: PersonUID | null = null;
  let sharedFolders: string[] = [];

  async function checkForShares(person: PersonUID) {
    errorMessage = null;
    sharedPerson = null;
    sharedFolders = [];
    if (!(account instanceof EWSAccount)) {
      return;
    }
    sharedPerson = person;
    if (account.dependentAccounts().find(other => other.username == sharedPerson.emailAddress)) {
      errorMessage = gt`You have already added this account`;
      return;
    }
    sharedFolders = await account.findSharedFolders(sharedPerson, ["msgfolderroot", "inbox", "contacts", "calendar"]);
    if (!sharedFolders.length) {
      errorMessage = gt`You have no access to this account`;
    }
  }

  async function onAddPerson(person: PersonUID) {
    assert(account instanceof EWSAccount, "Not supported");
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
    sharedPerson = null;
  }
</script>

<style>
  .sharing-outgoing {
    max-width: 40em;
  }
  .subtitle {
    font-weight: normal;
  }
  .nothing {
    opacity: 50%;
  }
</style>
