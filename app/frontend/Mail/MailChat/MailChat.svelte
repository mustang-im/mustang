<Splitter name="persons-list" initialRightRatio={4}>
  <vbox class="left-pane" slot="left">
    <hbox class="buttons">
      <AccountDropDown
        bind:selectedAccount={$selectedAccount}
        accounts={accounts}
        filterByWorkspace={true}
        />
      <hbox flex class="spacer" />
      <WriteButton account={$selectedAccount} />
    </hbox>
    <PersonsList {persons} bind:selected={selectedPerson} />
    <ViewSwitcher />
  </vbox>
  <vbox class="right-pane" slot="right">
    {#if filteredMessages && selectedPerson }
      <PaymentBar account={$selectedAccount} showWhenNoAccount={false} />
      <Header person={selectedPerson} />
      <vbox flex class="messages background-pattern">
        <MessageList messages={filteredMessages}>
          <svelte:fragment slot="message" let:message let:previousMessage>
            <MailMessage {message} {previousMessage} />
          </svelte:fragment>
        </MessageList>
      </vbox>
      <vbox class="editor">
        <MsgEditor to={chatRoom} />
      </vbox>
    {/if}
  </vbox>
</Splitter>

<script lang="ts">
  import { MailChatRoom } from "./MailChatRoom";
  import type { MailAccount } from "../../../logic/Mail/MailAccount";
  import type { Folder } from "../../../logic/Mail/Folder";
  import type { EMail } from "../../../logic/Mail/EMail";
  import type { PersonUID } from "../../../logic/Abstract/PersonUID";
  import { selectedAccount } from "../Selected";
  import { globalSearchTerm } from "../../AppsBar/selectedApp";
  import PersonsList from "../../Contacts/Person/PersonsList.svelte";
  import Header from "../../Chat/PersonHeader.svelte";
  import MessageList from "../../Chat/MessageView/MessageList.svelte";
  import MailMessage from "./MailMessage.svelte";
  import MsgEditor from "../../Chat/MsgEditor.svelte";
  import ViewSwitcher from "../LeftPane/ViewSwitcher.svelte";
  import WriteButton from "../LeftPane/WriteButton.svelte";
  import AccountDropDown from "../../Shared/AccountDropDown.svelte";
  // #if [PROPRIETARY]
  import PaymentBar from "../../Settings/License/Banner/PaymentBar.svelte";
  // #else
  import PaymentBar from "../../Shared/Empty.svelte";
  // #endif
  import Splitter from "../../Shared/Splitter.svelte";
  import { Collection, mergeColls } from 'svelte-collections';

  export let accounts: Collection<MailAccount>; /** in */

  let selectedPerson: PersonUID;
  $: folders = mergeColls<Folder>($accounts.map(account => account.rootFolders));
  // $: folders = $accounts.map(account => account.inbox);
  $: allMessages = mergeColls<EMail>($folders.map(folder => folder.messages)).sortBy(msg => -msg.sent.getTime());
  $: persons = $allMessages.map(msg => msg.contact as PersonUID).unique();
  $: personMessages = $allMessages.filterObservable(msg => msg.contact == selectedPerson);
  $: filteredMessages = $globalSearchTerm
    ? personMessages.filterObservable(msg => msg.text?.toLowerCase().includes($globalSearchTerm))
    : personMessages;
  $: account = $personMessages.first?.folder.account ?? $accounts.first;
  $: chatRoom = new MailChatRoom(account, selectedPerson, personMessages);
</script>

<style>
  .left-pane {
    box-shadow: 2px 0px 6px 0px rgba(0, 0, 0, 10%); /* Also on MessageList */
    background-color: var(--leftbar-bg);
    color: var(--leftbar-fg);
  }
  .editor {
    height: 96px;
  }
  .buttons {
    margin: 10px 16px;
    justify-content: end;
  }
  .buttons :global(svg) {
    margin: 4px;
  }
  .spacer {
    min-width: 8px;
  }
</style>
