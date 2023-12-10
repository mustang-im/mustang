<hbox flex class="chat app">
  <vbox class="left-pane">
    <PersonsList persons={appGlobal.persons} bind:selected={selectedPerson} />
  </vbox>
  <vbox class="right-pane">
    {#if personMessages && selectedPerson }
      <Header person={selectedPerson} />
      <vbox flex class="messages">
        <MessageList messages={personMessages} />
      </vbox>
      <vbox class="editor">
        <MsgEditor to={dummyChat} />
      </vbox>
    {/if}
  </vbox>
</hbox>

<script lang="ts">
  //import type { Account, MsgFolder, Email } from "mustang-lib";
  import type { MailAccount } from "../../logic/Mail/Account";
  import type { Folder } from "../../logic/Mail/Folder";
  import type { EMail } from "../../logic/Mail/Message";
  import type { Person } from "../../../logic/Abstract/Person";
  import { Chat } from "../../../logic/Chat/Chat";
  import { appGlobal } from "../../../logic/app";
  import { Collection, mergeColls } from 'svelte-collections';
  import PersonsList from "../../Shared/Person/PersonsList.svelte";
  import Header from "../../Chat/PersonHeader.svelte";
  import MessageList from "../../Chat/MessageView/MessageList.svelte";
  import MsgEditor from "../../Chat/MsgEditor.svelte";
  import { faker } from "@faker-js/faker";

  export let accounts: Collection<MailAccount>; /** in */

  let selectedPerson: Person;
  $: rootFolders = mergeColls<Folder>(accounts.map(account => account.rootFolders).values());
  $: allMessages = mergeColls<EMail>(rootFolders.map(folder => folder.messages).values());
  $: personMessages = allMessages.filter(msg => msg.contact == selectedPerson).sortBy(msg => msg.received);
  $: dummyChat = createDummyChat(selectedPerson);
  function createDummyChat(person: Person): Chat {
    let chat = new Chat();
    chat.id = faker.datatype.uuid();
    chat.contact = person;
    chat.messages.addAll(personMessages);
    chat.lastMessage = personMessages.last;
    return chat;
  }
</script>

<style>
  .left-pane {
    flex: 1 0 0;
    box-shadow: 2px 0px 6px 0px rgba(0, 0, 0, 10%); /* Also on MessageList */
    max-width: 20em;
    background-color: #F9F9FD;
  }
  .right-pane {
    flex: 2 0 0;
  }
  .messages {
    background-color: #F9F9FD;
  }
  .editor {
    height: 96px;
  }
</style>
