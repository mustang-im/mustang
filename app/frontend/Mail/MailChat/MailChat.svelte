<Splitter name="persons-list" initialRightRatio={4}>
  <vbox class="left-pane" slot="left">
    <hbox class="buttons">
      <AccountDropDown
        bind:selectedAccount={$selectedAccount}
        accounts={accounts}
        filterByWorkspace={true}
        />
      <hbox flex class="spacer" />
      <WriteButton selectedAccount={$selectedAccount} />
    </hbox>
    <PersonsList persons={appGlobal.persons} bind:selected={selectedPerson} />
    <ViewSwitcher />
  </vbox>
  <vbox class="right-pane" slot="right">
    {#if filteredMessages && selectedPerson }
      <Header person={selectedPerson} />
      <vbox flex class="messages">
        <MessageList messages={filteredMessages}>
          <svelte:fragment slot="message" let:message let:previousMessage>
            {#if message instanceof EMail }
              <MailMessage {message} {previousMessage} />
            {/if}
          </svelte:fragment>
        </MessageList>
      </vbox>
      <vbox class="editor">
        <MsgEditor to={dummyChat} />
      </vbox>
    {/if}
  </vbox>
</Splitter>

<script lang="ts">
  import type { MailAccount } from "../../../logic/Mail/MailAccount";
  import type { Folder } from "../../../logic/Mail/Folder";
  import { EMail } from "../../../logic/Mail/EMail";
  import type { Person } from "../../../logic/Abstract/Person";
  import { Chat } from "../../../logic/Chat/Chat";
  import { appGlobal } from "../../../logic/app";
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
  import Splitter from "../../Shared/Splitter.svelte";
  import { Collection, mergeColls } from 'svelte-collections';
  import { faker } from "@faker-js/faker";

  export let accounts: Collection<MailAccount>; /** in */

  let selectedPerson: Person;
  $: rootFolders = mergeColls<Folder>(accounts.map(account => account.rootFolders));
  $: allMessages = mergeColls<EMail>(rootFolders.map(folder => folder.messages));
  $: personMessages = allMessages.filter(msg => msg.contact == selectedPerson).sortBy(msg => msg.sent);
  $: filteredMessages = $globalSearchTerm
    ? personMessages.filter(msg => msg.text?.toLowerCase().includes($globalSearchTerm))
    : personMessages;
  $: dummyChat = createDummyChat(selectedPerson);
  function createDummyChat(person: Person): Chat {
    let chat = new Chat(accounts.first);
    chat.id = faker.string.uuid();
    chat.contact = person;
    chat.messages.addAll(personMessages);
    chat.lastMessage = personMessages.last;
    return chat;
  }
</script>

<style>
  .left-pane {
    box-shadow: 2px 0px 6px 0px rgba(0, 0, 0, 10%); /* Also on MessageList */
    background-color: var(--leftbar-bg);
    color: var(--leftbar-fg);
  }
  .messages {
    background: url(../../asset/background-repeat.png) repeat;
    background-color: var(--main-pattern-bg);
    color: var(--main-pattern-fg);
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
