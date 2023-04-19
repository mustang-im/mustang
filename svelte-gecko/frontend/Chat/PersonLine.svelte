<hbox class="person">
  <vbox class="image">
    <img
      src={person.picture}
      width="64" height="64"
      title="Picture of {person.name}"
      alt="Picture of {person.name}" />
  </vbox>
  <vbox class="right">
    <hbox class="name">{person.name}</hbox>
    {#if lastMessage}
      <hbox class="last-msg">{lastMessage.text.substring(0, 30)}</hbox>
    {/if}
  </vbox>
</hbox>

<script lang="ts">
  import type { ChatPerson } from "../../logic/Chat/Person";
  import { appGlobal } from "../../logic/app";

  export let person: ChatPerson;

  $: lastMessage = appGlobal?.chatAccounts.first?.messagesByPerson.get(person)?.sortBy(msg => msg.sent).reverse().first;
</script>

<style>
  .person, .right, .name, .last-msg {
    flex: 1 0 0;
  }
  .image {
    width: 64px;
    height: 64px;
    margin: 10px;
    clip-path: circle();
  }
  .right {
    margin: 10px;
    border-bottom: 1px dotted lightgray;
  }
  .last-msg {
    opacity: 50%;
  }
</style>
