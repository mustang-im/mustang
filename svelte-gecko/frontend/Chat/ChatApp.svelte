<hbox flex class="chat app">
  <vbox class="left-pane">
    <PersonsList persons={personsSorted} bind:selected={selectedPerson}/>
  </vbox>
  <vbox class="right-pane">
    {#if messages && selectedPerson }
      <Header person={selectedPerson} />
      <vbox flex class="messages">
          <MessageList {messages} />
      </vbox>
      <vbox class="editor">
        <MsgEditor to={selectedPerson} from={account} />
      </vbox>
    {/if}
  </vbox>
</hbox>

<script lang="ts">
  import type { ChatAccount } from "../../logic/Chat/Account";
  import type { ChatPerson } from "../../logic/Chat/Person";
  import PersonsList from "./PersonsList.svelte";
  import Header from "./PersonHeader.svelte";
  import MessageList from "./MessageView/MessageList.svelte";
  import MsgEditor from "./MsgEditor.svelte";

  export let account: ChatAccount;

  let selectedPerson: ChatPerson;
  $: messages = account.chats.get(selectedPerson)?.messages;
  $: personsSorted = account.persons.sortBy(person => person.lastMessage.sent).reverse();
</script>

<style>
  .left-pane {
    flex: 1 0 0;
  }
  .right-pane {
    flex: 2 0 0;
  }
  .messages {
    background-color: #F3F3F3;
  }
  .editor {
    height: 96px;
  }
</style>
