<Route path="compose">
  <MailComposer mail={params?.mail ?? $selectedFolder.newEMail()} />
</Route>
{#if appGlobal.isMobile}
  <Route path="folder/:accountID/:folderID/message-list">
    <MsgListM messages={params?.messages ?? searchMessages ?? $selectedFolder?.messages ?? requiredParam()} bind:searchMessages bind:selectedFolder={$selectedFolder} bind:selectedMessage={$selectedMessage} bind:selectedMessages={$selectedMessages} />
  </Route>
  <Route path="message/:accountID/:folderID/:messageID/display">
    <MessageDisplay message={params?.message ?? $selectedMessage ?? requiredParam()} />
  </Route>
  <Route path="search">
    <SearchM />
  </Route>
  <Route path="/">
    {params?.account ? $selectedAccount = params.account : null,
     params?.folder ? $selectedFolder = params.folder : null, ""}
    <AccountsM {accounts} {folders} bind:selectedAccount={$selectedAccount} bind:selectedFolder={$selectedFolder} />
  </Route>
{:else}
  <Route path="/">
    <MailApp />
  </Route>
{/if}

<script lang="ts">
  import { showAccounts } from "../../logic/Mail/AccountsList/ShowAccounts";
  import type { Folder } from "../../logic/Mail/Folder";
  import type { EMail } from "../../logic/Mail/EMail";
  import { Person } from "../../logic/Abstract/Person";
  import { selectedAccount, selectedFolder, selectedMessage, selectedMessages } from "./Selected";
  import { selectedWorkspace } from "../MainWindow/Selected";
  import { selectedPerson } from "../Contacts/Person/Selected";
  import { getLocalStorage } from "../Util/LocalStorage";
  import { appGlobal } from "../../logic/app";
  import MailApp from "./MailApp.svelte";
  import MailComposer from "./Composer/MailComposer.svelte";
  import MsgListM from "./Vertical/MessageListM.svelte";
  import SearchM from "./Search/SearchM.svelte";
  import MessageDisplay from "./Message/MessageDisplay.svelte";
  import AccountsM from "./LeftPane/AccountsM.svelte";
  import { showError } from "../Util/error";
  import { ArrayColl } from "svelte-collections";
  import { getParams } from "../AppsBar/selectedApp";
  import { requiredParam } from "../Util/route";
  import { Route, useLocation } from "svelte-navigator";

  $: accounts = showAccounts.filterObservable(acc => acc.workspace == $selectedWorkspace || !$selectedWorkspace); // ?? acc == allAccountsAccount
  $: folders = $selectedAccount?.rootFolders ?? new ArrayColl<Folder>();
  $: location = useLocation();
  $: params = getParams($location.state);

  let searchMessages: ArrayColl<EMail> | null;

  $: loadFolder($selectedFolder).catch(showError);
  async function loadFolder(folder: Folder) {
    try {
      if (!folder) {
        return;
      }
      if ($selectedMessage?.folder != folder) {
        $selectedMessage = null;
      }
      await folder.listMessages();
    } catch (ex) {
      if (ex.authFail) {
        // await folder.account.login(true);
        // await folder.listMessages();
      } else {
        showError(ex);
      }
    }
  }

  $: $selectedMessage && selectPerson($selectedMessage)
  function selectPerson(message: EMail) {
    if (view == "chat") {
      return;
    }
    if (message.contact instanceof Person) {
      $selectedPerson = message.contact;
      return;
    }
    let personUID = message.outgoing ? message.to.first : message.from;
    let person = personUID?.findPerson();
    if (!person) {
      return;
    }
    $selectedPerson = person;
  }

  let viewSetting = getLocalStorage("mail.view", "vertical");
  $: view = $viewSetting.value;

  /*
  function ensureFolder(folder: Writable<Folder>, params: any): string {
    if (get(folder)) {
      return "";
    }
    folder.set(getFolderByID(params.accountID, params.folderID));
    return "";
  }
  function ensureMessage(message: Writable<EMail>, params: any): string {
    if (get(message)) {
      return "";
    }
    message.set(getMessageByID(params.accountID, params.folderID, params.messageID));
    return "";
  }
  function getAccountByID(accountID: string): MailAccount {
    let account = appGlobal.emailAccounts.find(acc => acc.id == accountID);
    assert(account, `Account ID ${accountID} not found`);
    return account;
  }
  function getFolderByID(accountID: string, folderID: string): Folder {
    let account = getAccountByID(accountID);
    let folder = account.findFolder(folder => folder.id == folderID);
    assert(folder, `Folder ID ${folderID} in account ${account.name} not found`);
    return folder;
  }
  function getMessageByID(accountID: string, folderID: string, messageID: string): EMail {
    let folder = getFolderByID(accountID, folderID);
    let message = folder.messages.find(msg => msg.id == messageID);
    assert(message, `Message ID ${messageID} in folder ${folder.name} in account ${folder.account.name} not found`);
    return message;
  }
  */
</script>
