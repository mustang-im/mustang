<vbox flex class="message-list">
  <FastList items={messages} bind:selectedItem={selectedMessage}>
    <svelte:fragment slot="header">
      <hbox>Correspondent</hbox>
      <hbox>Subject</hbox>
      <hbox>Date</hbox>
    </svelte:fragment>
    <svelte:fragment slot="row" let:item={msg}>
      <hbox class="correspondent">{msg.contact.name}</hbox>
      <hbox class="subject" class:read={msg.read}>{msg.subject}</hbox>
      <hbox class="date">{getDateString(msg.received)}</hbox>
      <hbox class="unread button" class:read={msg.read}>
        <Button
          icon={CircleIcon}
          iconSize="10px"
          iconOnly
          label={msg.read ? "Mark this message as unread" : "Mark this message as read"}
          on:click={() => toggleRead(msg)}
          plain
          />
      </hbox>
      <hbox class="star button" class:starred={msg.starred}>
        <Button
          icon={StarIcon}
          iconSize="14px"
          iconOnly
          label="Remember this message"
          on:click={() => toggleStar(msg)}
          plain
          />
      </hbox>
    </svelte:fragment>
  </FastList>
</vbox>

<script lang="ts">
  import type { EMail } from "../../../logic/Mail/Message";
  import type { Collection } from "svelte-collections";
  import FastList from "../../Shared/FastList.svelte";
  import Button from "../../Shared/Button.svelte";
  import StarIcon from "lucide-svelte/icons/star";
  import CircleIcon from "lucide-svelte/icons/circle";
  import { getDateString } from "../../Util/date";

  export let messages: Collection<EMail>;
  export let selectedMessage: EMail;

  function toggleRead(message: EMail) {
    message.read = !message.read;
  }
  function toggleStar(message: EMail) {
    message.starred = !message.starred;
  }
</script>

<style>
  .message-list :global(.fast-list thead tr hbox) {
    background-color: white;
  }
  .message-list :global(.fast-list table) {
    padding-left: 4px;
  }
  .subject:not(.read) {
    font-weight: bold;
  }
  .button {
    width: 20px;
    vertical-align: middle;
  }
  .button :global(svg) {
    stroke-width: 1px;
  }
  .star.starred :global(svg) {
    fill: orange;
  }
  .unread:not(.read) :global(svg) {
    fill: green;
  }
</style>
