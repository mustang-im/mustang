<hbox class="chat app">
  <vbox class="left-pane">
    <PersonsList persons={account.persons} bind:selected={selectedPerson}/>
  </vbox>
  <vbox class="right-pane">
    {#if messages }
      <MessageList {messages} />
    {/if}
  </vbox>
</hbox>

<script lang="ts">
  import type { Person } from "../../logic/Person/Person";
  import MessageList from "./MessageView/MessageList.svelte";
  import PersonsList from "./PersonsList.svelte";
  import type { ChatAccount } from "../../logic/Chat/Account";

  export let account: ChatAccount;

  let selectedPerson: Person;
  $: messages = account.messagesByPerson.get(selectedPerson);
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
</style>
