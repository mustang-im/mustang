<hbox class="mail-app">
  <vbox class="folder-pane">
    <ProjectList />
    <AccountList {accounts} bind:selectedAccount />
    <FolderList folders={selectedAccount ? selectedAccount.folders : null} bind:selectedFolder />
  </vbox>
  <vbox class="message-list-pane">
    <MessageList messages={selectedFolder ? selectedFolder.messages : null} bind:selectedMessage />
  </vbox>
  <vbox class="message-display-pane">
    {#if selectedMessage}
      <MessageDisplay message={selectedMessage} />
    {:else}
      <StartPage />
    {/if}
  </vbox>
</hbox>

<script lang="ts">
  import type { Account, MsgFolder, Email } from "mustang-lib";
  import { translateElements, pluralform } from "mustang-lib/trex/translate";

  import AccountList from "./AccountList/AccountList.svelte";
  import FolderList from "./FolderList/FolderList.svelte";
  import MessageDisplay from "./Message/MessageDisplay.svelte";
  import MessageList from "./MessageList/MessageList.svelte";
  import ProjectList from "./ProjectList/ProjectList.svelte";
  import StartPage from "./StartPage.svelte";
  import { backgroundError, showError } from "../Util/error";
  import { onMount } from "svelte";

  let accounts: Account[] = [];
  let selectedAccount: Account;
  let selectedFolder: MsgFolder;
  let selectedMessage: Email;

  /*onMount(onLoad);
  async function onLoad() {
    try {
      accounts = remote.getGlobal("accounts");

      for (let account of accounts.contents) {
        if (await account.haveStoredLogin()) {
          try {
            await account.login();
            await account.inbox.fetch();
          } catch (e) { backgroundError(e); }
        }
      }
    } catch (ex) {
      showError(ex);
    }
  }*/

  $: loadFolder(selectedFolder);
  async function loadFolder(folder: MsgFolder) {
    try {
      if (!folder) {
        return;
      }
      await folder.fetch();
    } catch (ex) {
      showError(ex);
    }
  }
</script>

<style>
  .mail-app {
    flex: 1 0 0;
  }
  .folder-pane {
    flex: 1 0 0;
    max-width: 15em;
  }
  .message-list-pane {
    flex: 1 0 0;
  }
  .message-display-pane {
    flex: 2 0 0;
  }
</style>
