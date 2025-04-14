<Route path="folder/message-list">
  <MsgListM {messages} bind:searchMessages bind:selectedFolder={$selectedFolder} bind:selectedMessage={$selectedMessage} bind:selectedMessages={$selectedMessages} />
</Route>
<Route path="message">
  <MessageDisplay message={$selectedMessage} />
</Route>
<Route path="search">
  <SearchM />
</Route>
<Route path="/">
  <AccountsM {accounts} {folders} bind:selectedAccount={$selectedAccount} bind:selectedFolder={$selectedFolder} />
</Route>

<script lang="ts">
  import { showAccounts } from "../../logic/Mail/AccountsList/ShowAccounts";
  import type { Folder } from "../../logic/Mail/Folder";
  import type { EMail } from "../../logic/Mail/EMail";
  import { Person } from "../../logic/Abstract/Person";
  import { selectedAccount, selectedFolder, selectedMessage, selectedMessages } from "./Selected";
  import { selectedWorkspace } from "../MainWindow/Selected";
  import { selectedPerson } from "../Contacts/Person/Selected";
  import { getLocalStorage } from "../Util/LocalStorage";
  import MsgListM from "./Vertical/MessageListM.svelte";
  import SearchM from "./Search/SearchM.svelte";
  import MessageDisplay from "./Message/MessageDisplay.svelte";
  import AccountsM from "./LeftPane/AccountsM.svelte";
  import { showError } from "../Util/error";
  import { ArrayColl } from "svelte-collections";
  import { Route } from "svelte-navigator";

  $: accounts = showAccounts.filter(acc => acc.workspace == $selectedWorkspace || !$selectedWorkspace); // || acc == allAccountsAccount
  $: folders = $selectedAccount?.rootFolders ?? new ArrayColl<Folder>();
  $: messages = searchMessages ?? $selectedFolder?.messages ?? new ArrayColl<EMail>();

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
</script>
