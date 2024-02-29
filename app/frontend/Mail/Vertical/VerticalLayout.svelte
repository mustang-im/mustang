<Splitter name="mail.vertical.folders" initialRightRatio={4}>
  <vbox flex class="folder-pane" slot="left">
    <AccountList accounts={$accounts} bind:selectedAccount />
    {#await selectedAccount?.rootFolders then rootFolders}
    <FolderList folders={rootFolders ?? new ArrayColl()} bind:selectedFolder />
    {/await}
    <ViewSwitcher />
  </vbox>
  <Splitter slot="right" name="mail.vertical.msgs" initialRightRatio={2}>
    <vbox flex class="message-list-pane" slot="left">
      <VerticalMessageList messages={selectedFolder?.messages ?? new ArrayColl()} bind:selectedMessage bind:selectedMessages />
    </vbox>
    <vbox flex class="message-display-pane" slot="right">
      {#if selectedMessage}
        <MessageDisplay message={selectedMessage} account={selectedAccount} />
      {:else}
        <StartPage />
      {/if}
    </vbox>
  </Splitter>
</Splitter>

<script lang="ts">
  import type MailAccount from "../../../../lib/logic/mail/MailAccount";
  import type Folder from "../../../../lib/logic/account/MsgFolder";
  import type EMail from "../../../../lib/logic/mail/EMail";

  import AccountList from "../LeftPane/AccountList.svelte";
  import FolderList from "../LeftPane/FolderList.svelte";
  import VerticalMessageList from "./VerticalMessageList.svelte";
  import MessageDisplay from "../Message/MessageDisplay.svelte";
  import StartPage from "../StartPage.svelte";
  import ViewSwitcher from "../LeftPane/ViewSwitcher.svelte";
  import Splitter from "../../Shared/Splitter.svelte";
  import { ArrayColl, Collection } from 'svelte-collections';

  export let accounts: Collection<MailAccount>; /** in */
  export let selectedAccount: MailAccount; /** in/out */
  export let selectedFolder: Folder; /** in/out */
  export let selectedMessage: EMail; /** in/out */

  let selectedMessages: ArrayColl<EMail>;

  let folders: Folder;
</script>

<style>
  .folder-pane {
    box-shadow: 2px 0px 6px 0px rgba(0, 0, 0, 8%); /* Also on MessageList */
    background-color: #F9F9FD;
  }
  .message-list-pane {
    box-shadow: 1px 0px 6px 0px rgba(0, 0, 0, 8%); /* Also on MessageList */
    z-index: 2;
  }
</style>
