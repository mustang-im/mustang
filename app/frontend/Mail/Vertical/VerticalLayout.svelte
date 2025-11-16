<Splitter name="mail.vertical.folders" initialRightRatio={4}>
  <LeftPane {accounts} {folders}
    bind:selectedAccount bind:selectedFolder bind:selectedFolders bind:searchMessages
    bind:activeTab={$selectedSearchTab}
    slot="left" />
  <Splitter slot="right" name="mail.vertical.msgs" initialRightRatio={2}>
    <vbox flex class="message-list-pane" slot="left">
      // #if [PROPRIETARY]
      <PaymentBar account={selectedAccount} showWhenNoAccount={false} />
      // #endif
      <FolderHeader folder={selectedFolder} {searchMessages} />
      <VerticalMessageList {messages} bind:selectedMessage bind:selectedMessages />
      <FolderFooter folder={selectedFolder} bind:searchMessages />
    </vbox>
    <InfoSidebarSplitter person={selectedMessage?.from} message={selectedMessage} slot="right">
      <vbox flex class="message-display-pane" slot="message">
        {#if selectedMessage}
          <MessageDisplay message={selectedMessage} />
        {:else}
          <StartPage />
        {/if}
      </vbox>
    </InfoSidebarSplitter>
  </Splitter>
</Splitter>

<script lang="ts">
  import type { MailAccount } from "../../../logic/Mail/MailAccount";
  import type { Folder } from "../../../logic/Mail/Folder";
  import type { EMail } from "../../../logic/Mail/EMail";
  import { selectedSearchTab } from "../Selected";
  import VerticalMessageList from "./VerticalMessageList.svelte";
  import LeftPane from "../LeftPane/LeftPane.svelte";
  import MessageDisplay from "../Message/MessageDisplay.svelte";
  import StartPage from "../StartPage.svelte";
  import FolderHeader from "../LeftPane/FolderHeader.svelte";
  import FolderFooter from "../LeftPane/FolderFooter.svelte";
  import InfoSidebarSplitter from "../InfoSidebar/InfoSidebarSplitter.svelte";
  // #if [PROPRIETARY]
  import PaymentBar from "../../Settings/License/Banner/PaymentBar.svelte";
  // #endif
  import Splitter from "../../Shared/Splitter.svelte";
  import type { ArrayColl, Collection } from 'svelte-collections';

  export let accounts: Collection<MailAccount>; /** in */
  export let messages: ArrayColl<EMail>; /** in */
  export let folders: Collection<Folder>; /** in */
  export let searchMessages: ArrayColl<EMail> | null; /** out */
  export let selectedAccount: MailAccount; /** in/out */
  export let selectedFolder: Folder; /** in/out */
  export let selectedMessage: EMail; /** in/out */
  export let selectedMessages: ArrayColl<EMail>; /** in/out */
  let selectedFolders: ArrayColl<Folder>;
</script>

<style>
  .message-list-pane,
  .message-display-pane {
    background-color: var(--main-bg);
    color: var(--main-fg);
  }
  .message-list-pane {
    box-shadow: 1px 0px 6px 0px rgba(0, 0, 0, 8%); /* Also on MessageList */
    z-index: 2;
  }
  .message-display-pane {
    padding-inline-start: 2px;
  }
</style>
