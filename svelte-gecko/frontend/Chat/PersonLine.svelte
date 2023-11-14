<hbox flex class="person">
  <vbox class="image">
    <img
      src={person.picture}
      width="64" height="64"
      title="Picture of {person.name}"
      alt="Picture of {person.name}" />
  </vbox>
  <vbox flex class="right">
    <hbox class="right-top">
      <hbox flex class="name">{person.name}</hbox>
      {#if person.lastMessage}
        <hbox class="last-time">{getDateString(person.lastMessage.sent)}</hbox>
      {/if}
    </hbox>
    {#if person.lastMessage}
      <hbox flex class="last-msg">{person.lastMessage.text.substring(0, 50)}</hbox>
    {/if}
  </vbox>
</hbox>

<script lang="ts">
  import type { ChatPerson } from "../../logic/Chat/Person";
  import { getDateString } from "../Util/date";

  export let person: ChatPerson;
</script>

<style>
  .image {
    width: 56px;
    height: 56px;
    margin: 7px;
    margin-left: 12px;
    clip-path: circle();
  }
  .right {
    margin-top: 0px;
    padding: 10px;
  }
  .name {
    font-size: 14px;
  }
  .last-time {
    opacity: 50%;
    font-size: x-small;
    margin-top: 3px;
  }
  .last-msg {
    opacity: 50%;
    margin-top: 0px;
    font-size: 11.5px;
    max-height: 1.8em;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
