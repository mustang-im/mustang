<hbox class="person">
  <vbox class="image">
    <img
      src={person.picture}
      width="64" height="64"
      title="Picture of {person.name}"
      alt="Picture of {person.name}" />
  </vbox>
  <vbox class="right">
    <hbox class="right-top">
      <hbox class="name">{person.name}</hbox>
      {#if person.lastMessage}
        <hbox class="last-time">{timeFormat.format(person.lastMessage.sent)}</hbox>
      {/if}
    </hbox>
    {#if person.lastMessage}
      <hbox class="last-msg">{person.lastMessage.text.substring(0, 50)}</hbox>
    {/if}
  </vbox>
</hbox>

<script lang="ts">
  import type { ChatPerson } from "../../logic/Chat/Person";

  export let person: ChatPerson;

  $: timeFormat = person.lastMessage?.sent.getDate() == new Date().getDate()
      ? timeOnlyFormat
      : timeAndDateFormat;
  const timeOnlyFormat = Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "numeric",
  });
  const timeAndDateFormat = Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  });
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
    margin-top: 5px;
    padding: 10px;
    border-bottom: 1px dotted lightgray;
  }
  .name {
  }
  .last-time {
    opacity: 50%;
    font-size: smaller;
  }
  .last-msg {
    opacity: 50%;
    font-size: smaller;
    max-height: 1.8em;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
