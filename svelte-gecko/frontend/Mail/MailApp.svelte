<hbox flex class="mail-app">
  <vbox flex class="folder-pane">
    <ProjectList />
    <AccountList {accounts} bind:selectedAccount />
    <FolderList folders={selectedAccount ? selectedAccount.folders : new ArrayColl()} bind:selectedFolder />
  </vbox>
  <vbox flex class="left-pane">
    <vbox flex class="message-list-pane">
      <MessageList messages={selectedFolder ? selectedFolder.messages : new ArrayColl()} bind:selectedMessage />
    </vbox>
    <vbox flex class="message-display-pane">
      {#if selectedMessage}
        <MessageDisplay message={selectedMessage} />
      {:else}
        <StartPage />
      {/if}
    </vbox>
  </vbox>
</hbox>

<script lang="ts">
  import type { Account, MsgFolder, Email } from "mustang-lib";
  //import { translateElements, pluralform } from "mustang-lib/trex/translate";

  import { getStartObjects } from "../../logic/app";
  import AccountList from "./AccountList/AccountList.svelte";
  import FolderList from "./FolderList/FolderList.svelte";
  import MessageDisplay from "./Message/MessageDisplay.svelte";
  import MessageList from "./MessageList/MessageList.svelte";
  import ProjectList from "./ProjectList/ProjectList.svelte";
  import StartPage from "./StartPage.svelte";
  import { backgroundError, showError } from "../Util/error";
  import { ArrayColl } from 'svelte-collections';
  import { onMount } from "svelte";

  let accounts = new ArrayColl<Account>();
  let selectedAccount: Account;
  let selectedFolder: MsgFolder;
  let selectedMessage: Email;

  onMount(onLoad);
  async function onLoad() {
    try {
      let appGlobal = await getStartObjects();
      //console.log("App Global", appGlobal, appGlobal?.emailAccounts?.contents);
      accounts.addAll(await appGlobal.emailAccounts.contents);

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
  }

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
  .folder-pane {
    flex: 1 0 0;
    max-width: 15em;
    box-shadow: 2px 0px 6px 0px rgba(0, 0, 0, 10%); /* Also on MessageList */
    z-index: 1;
  }
  .left-pane {
    flex: 3 0 0;
  }
  .mail-app :global(.fast-list) {
    background-color: #F9F9FD;
    border: none;
  }
  .mail-app :global(.fast-list table) {
    padding-left: 4px;
  }
  .mail-app :global(.fast-list thead tr hbox) {
    vertical-align: middle;
    border: none;
    color: grey;
    font-size: 12px;
    padding: 0px 6px;
  }
  .mail-app :global(.fast-list thead) {
    height: 32px;
  }
  .mail-app :global(.fast-list tbody tr hbox) {
    font-size: 13px;
  }
</style>
