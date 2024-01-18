<hbox flex class="mail-app">
  <vbox flex class="folder-pane">
    <AccountList accounts={$accounts} bind:selectedAccount />
    <FolderList folders={selectedAccount?.rootFolders ?? new ArrayColl()} bind:selectedFolder />
    <ViewSwitcher />
  </vbox>
  <vbox flex class="message-list-pane">
    <VerticalMessageList messages={selectedFolder?.messages ?? new ArrayColl()} bind:selectedMessage bind:selectedMessages />
  </vbox>
  <vbox flex class="message-display-pane">
    {#if selectedMessage}
      <MessageDisplay message={selectedMessage} account={selectedAccount} />
    {:else}
      <StartPage />
    {/if}
  </vbox>
</hbox>

<script lang="ts">
  //import type { Account, MsgFolder, Email } from "mustang-lib";
  import type { MailAccount } from "../../../logic/Mail/Account";
  import type { Folder } from "../../../logic/Mail/Folder";
  import type { EMail } from "../../../logic/Mail/Message";

  import AccountList from "../LeftPane/AccountList.svelte";
  import FolderList from "../LeftPane/FolderList.svelte";
  import VerticalMessageList from "./VerticalMessageList.svelte";
  import MessageDisplay from "../Message/MessageDisplay.svelte";
  import StartPage from "../StartPage.svelte";
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
    box-shadow: 2px 0px 6px 0px rgba(0, 0, 0, 8%); /* Also on MessageList */
    background-color: #F9F9FD;
  }
  .message-list-pane {
    box-shadow: 1px 0px 6px 0px rgba(0, 0, 0, 8%); /* Also on MessageList */
    z-index: 2;
  }
  .message-display-pane {
    flex: 2 0 0;
  }
</style>
