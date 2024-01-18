<hbox flex class="mail-app">
  <vbox flex class="folder-pane">
    <!--<ProjectList />-->
    <AccountList accounts={$accounts} bind:selectedAccount />
    <FolderList folders={selectedAccount ? selectedAccount.rootFolders : new ArrayColl()} bind:selectedFolder />
    <ViewSwitcher />
  </vbox>
  <vbox flex class="left-pane">
    <vbox flex class="message-list-pane">
      <TableMessageList messages={selectedFolder?.messages ?? new ArrayColl()} bind:selectedMessage bind:selectedMessages />
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

  let selectedMessages: ArrayColl<EMail>;
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
</style>
