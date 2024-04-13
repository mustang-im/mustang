<Splitter name="mail.vertical.folders" initialRightRatio={4}>
  <vbox flex class="folder-pane" slot="left">
    <AccountList accounts={$accounts} bind:selectedAccount>
      <hbox class="buttons" slot="top-right">
        <WriteButton {selectedAccount} />
      </hbox>
    </AccountList>
    <FolderList folders={selectedAccount?.rootFolders ?? new ArrayColl()} bind:selectedFolder />
    <ViewSwitcher />
  </vbox>
  <Splitter slot="right" name="mail.vertical.msgs" initialRightRatio={2}>
    <vbox flex class="message-list-pane" slot="left">
      <VerticalMessageList messages={selectedFolder?.messages ?? new ArrayColl()} bind:selectedMessage bind:selectedMessages />
    </vbox>
    <vbox flex class="message-display-pane" slot="right">
      {#if selectedMessage}
        <MessageDisplay message={selectedMessage} />
      {:else}
        <StartPage />
      {/if}
    </vbox>
  </Splitter>
</Splitter>

<script lang="ts">
  import type { MailAccount } from "../../../logic/Mail/MailAccount";
  import type { Folder } from "../../../logic/Mail/Folder";
  import type { EMail } from "../../../logic/Mail/EMail";

  import AccountList from "../LeftPane/AccountList.svelte";
  import FolderList from "../LeftPane/FolderList.svelte";
  import VerticalMessageList from "./VerticalMessageList.svelte";
  import MessageDisplay from "../Message/MessageDisplay.svelte";
  import StartPage from "../StartPage.svelte";
  import ViewSwitcher from "../LeftPane/ViewSwitcher.svelte";
  import WriteButton from "../LeftPane/WriteButton.svelte";
  import Splitter from "../../Shared/Splitter.svelte";
  import { ArrayColl, Collection } from 'svelte-collections';

  export let accounts: Collection<MailAccount>; /** in */
  export let selectedAccount: MailAccount; /** in/out */
  export let selectedFolder: Folder; /** in/out */
  export let selectedMessage: EMail; /** in/out */
  export let selectedMessages: ArrayColl<EMail>; /** in/out */
</script>

<style>
  .folder-pane {
    box-shadow: 2px 0px 6px 0px rgba(0, 0, 0, 8%); /* Also on MessageList */
    background-color: var(--leftbar-bg);
    color: var(--leftbar-fg);
  }
  .message-list-pane,
  .message-display-pane {
    background-color: var(--main-bg);
    color: var(--main-fg);
  }
  .message-list-pane {
    box-shadow: 1px 0px 6px 0px rgba(0, 0, 0, 8%); /* Also on MessageList */
    z-index: 2;
  }

  .buttons {
    margin: 8px 8px 0 8px;
  }
  .buttons :global(svg) {
    margin: 4px;
  }
</style>
