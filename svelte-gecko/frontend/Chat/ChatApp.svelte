<hbox class="chat app">
  <vbox class="left-pane">
    <PersonsList persons={personsSorted} bind:selected={selectedPerson}/>
  </vbox>
  <vbox class="right-pane">
    {#if messages && selectedPerson }
      <vbox class="messages">
          <MessageList {messages} />
      </vbox>
      <vbox class="editor">
        <MsgEditor to={selectedPerson} from={account} />
      </vbox>
    {/if}
  </vbox>
</hbox>

<script lang="ts">
  import type { ChatPerson } from "../../logic/Chat/Person";
  import MessageList from "./MessageView/MessageList.svelte";
  import PersonsList from "./PersonsList.svelte";
  import type { ChatAccount } from "../../logic/Chat/Account";
  import MsgEditor from "./MsgEditor.svelte";

  export let account: ChatAccount;

  let selectedPerson: ChatPerson;
  $: messages = account.messagesByPerson.get(selectedPerson)?.sortBy(msg => msg.sent);
  $: personsSorted = account.persons.sortBy(person => account.messagesByPerson.get(person)?.sortBy(msg => msg.sent).reverse().first.sent);
  $: console.log(selectedPerson?.name, selectedPerson, messages?.first.text);
</script>

<style>
  .app {
    flex: 1 0 0;
  }
  .left-pane {
    flex: 1 0 0;
  }
  .right-pane {
    flex: 2 0 0;
  }
  .messages {
    flex: 1 0 0;
  }
  .editor {
    height: 96px;
  }
</style>
