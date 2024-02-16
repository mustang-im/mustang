<Splitter name="persons-list" initialRightRatio={4}>
  <vbox class="left-pane" slot="left">
    <PersonsList persons={appGlobal.persons} bind:selected={selectedPerson} />
    <ViewSwitcher />
  </vbox>
  <vbox class="right-pane" slot="right">
    {#if personMessages && selectedPerson }
      <Header person={selectedPerson} />
      <vbox flex class="messages">
        <MessageList messages={personMessages}>
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
  import type MailAccount from "../../../../lib/logic/mail/MailAccount";
  import type Folder from "../../../../lib/logic/account/MsgFolder";
  import type EMail from "../../../../lib/logic/mail/EMail";
  import type { Person } from "../../../logic/Abstract/Person";
  import { Chat } from "../../../logic/Chat/Chat";
  import { appGlobal } from "../../../logic/app";
  import { Collection, mergeColls } from 'svelte-collections';
  import PersonsList from "../../Shared/Person/PersonsList.svelte";
  import Header from "../../Chat/PersonHeader.svelte";
  import MessageList from "../../Chat/MessageView/MessageList.svelte";
  import MailMessage from "./MailMessage.svelte";
  import MsgEditor from "../../Chat/MsgEditor.svelte";
  import ViewSwitcher from "../LeftPane/ViewSwitcher.svelte";
  import Splitter from "../../Shared/Splitter.svelte";
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
    box-shadow: 2px 0px 6px 0px rgba(0, 0, 0, 10%); /* Also on MessageList */
    background-color: #F9F9FD;
  }
  .messages {
    background-color: #F9F9FD;
  }
  .editor {
    height: 96px;
  }
</style>
