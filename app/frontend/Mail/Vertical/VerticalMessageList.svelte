<vbox flex class="message-list">
  <FastList items={sortedMessages} bind:selectedItem={selectedMessage}>
    <svelte:fragment slot="header">
    </svelte:fragment>
    <vbox slot="row" class="message" let:item={msg} class:read={msg.read} class:unread={!msg.read}>
      <hbox class="top-row">
        <hbox class="contact">{msg.contact.name}</hbox>
        <hbox flex />
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
        <hbox class="unread button">
          <Button
            icon={CircleIcon}
            iconSize="8px"
            iconOnly
            label={msg.read ? "Mark this message as unread" : "Mark this message as read"}
            on:click={() => toggleRead(msg)}
            plain
            />
        </hbox>
        <hbox class="date">{getDateString(msg.received)}</hbox>
      </hbox>
      <hbox class="bottom-row">
        <hbox class="subject">{msg.subject}</hbox>
      </hbox>
    </vbox>
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

  $: sortedMessages = messages.sortBy(email => -email.received.getTime());

  function toggleRead(message: EMail) {
    message.read = !message.read;
  }
  function toggleStar(message: EMail) {
    message.starred = !message.starred;
  }
</script>

<style>
  .message-list :global(.fast-list) {
    margin-top: 8px;
    padding-left: 4px;
  }
  .message-list :global(.fast-list thead) {
    display: none;
  }
  .message {
    padding: 4px 8px !important;
  }
  .top-row {
    margin-bottom: -1px;
  }
  .contact {
    font-weight: bold;
  }
  .date {
    min-width: 2.5em
  }
  .message.unread .date {
    font-weight: bold;
  }
  .subject {
    line-height: 1.3;
  }
  .button {
    width: 20px;
    vertical-align: middle;
  }
  .button :global(svg) {
    stroke-width: 1px;
  }
  :global(tr:not(:hover)) .star:not(.starred) {
    opacity: 0;
  }
  .star.starred :global(svg) {
    fill: orange;
  }
  :global(tr:not(:hover)) .message.read .unread :global(svg) {
    opacity: 0;
  }
  .message.unread .unread :global(svg) {
    fill: green;
  }
</style>
