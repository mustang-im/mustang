<vbox class="message" class:read={$message.read} class:unread={!$message.read}>
  <hbox class="top-row">
    <hbox class="contact">{message.contact.name}</hbox>
    <hbox flex />
    <hbox class="star button" class:starred={$message.starred}>
      <Button
        icon={StarIcon}
        iconSize="14px"
        iconOnly
        label="Remember this message"
        on:click={() => toggleStar(message)}
        plain
        />
    </hbox>
    <hbox class="unread button">
      <Button
        icon={CircleIcon}
        iconSize="8px"
        iconOnly
        label={message.read ? "Mark this message as unread" : "Mark this message as read"}
        on:click={() => toggleRead(message)}
        plain
        />
    </hbox>
    <hbox class="date">{getDateString($message.received)}</hbox>
  </hbox>
  <hbox class="bottom-row">
    <hbox class="subject">{$message.subject}</hbox>
  </hbox>
</vbox>

<script lang="ts">
  import type EMail from "../../../../lib/logic/mail/EMail";
  import Button from "../../Shared/Button.svelte";
  import StarIcon from "lucide-svelte/icons/star";
  import CircleIcon from "lucide-svelte/icons/circle";
  import { getDateString } from "../../Util/date";

  export let message: EMail;

  function toggleRead(message: EMail) {
    message.read = !message.read;
  }
  function toggleStar(message: EMail) {
    message.starred = !message.starred;
  }
</script>

<style>
  .message {
    padding: 4px 8px !important;
    justify-content: baseline;
    align-items: baseline;
  }
  .top-row,
  .bottom-row {
    width: 100%;
    overflow: hidden;
  }
  .top-row {
    height: 1.5em;
    margin-bottom: -1px;
  }
  .bottom-row {
    height: 1.3em;
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
    vertical-align: bottom;
  }
  .button :global(svg) {
    stroke-width: 1px;
  }
  :global(.row:not(:hover)) .star:not(.starred) :global(svg) {
    opacity: 0;
  }
  .star.starred :global(svg) {
    fill: orange;
  }
  :global(.row:not(:hover)) .message.read .unread :global(svg) {
    opacity: 0;
  }
  .message.unread .unread :global(svg) {
    fill: green;
  }
</style>
