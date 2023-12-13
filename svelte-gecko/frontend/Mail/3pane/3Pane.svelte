<hbox flex class="mail-app">
  <vbox flex class="folder-pane">
    <!--<ProjectList />-->
    <AccountList accounts={$accounts} bind:selectedAccount />
    <FolderList folders={selectedAccount ? selectedAccount.rootFolders : new ArrayColl()} bind:selectedFolder />
    <ViewSwitcher />
  </vbox>
  <vbox flex class="left-pane">
    <vbox flex class="message-list-pane">
      <TableMessageList messages={selectedFolder ? selectedFolder.messages : new ArrayColl()} bind:selectedMessage />
    </vbox>
    <vbox flex class="message-display-pane">
      {#if selectedMessage}
        <MessageDisplay message={selectedMessage} account={selectedAccount} />
      {/if}
    </vbox>
  </vbox>
</hbox>

<script lang="ts">
  //import type { Account, MsgFolder, Email } from "mustang-lib";
  import type { MailAccount } from "../../../logic/Mail/Account";
  import type { Folder } from "../../../logic/Mail/Folder";
  import type { EMail } from "../../../logic/Mail/Message";

  import AccountList from "../LeftPane/AccountList.svelte";
  import FolderList from "../LeftPane/FolderList.svelte";
  import ProjectList from "../LeftPane/ProjectList.svelte";
  import TableMessageList from "./TableMessageList.svelte";
  import MessageDisplay from "../Message/MessageDisplay.svelte";
  import ViewSwitcher from "../LeftPane/ViewSwitcher.svelte";
  import { ArrayColl, Collection } from 'svelte-collections';

  export let accounts: Collection<MailAccount>; /** in */
  export let selectedAccount: MailAccount; /** in/out */
  export let selectedFolder: Folder; /** in/out */
  export let selectedMessage: EMail; /** in/out */
</script>

<style>
  .folder-pane {
    flex: 1 0 0;
    max-width: 15em;
    box-shadow: 2px 0px 6px 0px rgba(0, 0, 0, 10%); /* Also on MessageList */
    z-index: 2;
    background-color: #F9F9FD;
  }
  .left-pane {
    flex: 3 0 0;
  }
  .mail-app :global(.fast-list) {
    background-color: transparent;
    border: none;
  }
  .mail-app :global(.fast-list thead tr > hbox) {
    vertical-align: middle;
    border: none;
    color: grey;
    font-size: 12px;
  }
  .mail-app :global(.fast-list thead) {
    height: 32px;
  }
  .mail-app :global(.fast-list tbody hbox) {
    font-size: 13px;
  }
  .mail-app :global(.fast-list tbody tr.selected) {
    background-color: #20AE9E;
    color: white;
  }
  .mail-app :global(.fast-list tbody tr:not(.selected):hover) {
    background-color: #A9DAD4;
  }
</style>
