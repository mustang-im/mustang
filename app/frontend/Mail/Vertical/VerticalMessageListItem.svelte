<vbox class="message"
  class:read={$message.isRead} class:unread={!$message.isRead}
  draggable="true" on:dragstart={(event) => catchErrors(() => onDragStartMail(event, message))}
  >
  <hbox class="top-row">
    <hbox class="contact">{message.contact.name}</hbox>
    <hbox flex />
    <hbox class="date">{getDateString($message.sent)}</hbox>
  </hbox>
  <hbox class="bottom-row">
    <hbox class="subject">{$message.subject}</hbox>
    <hbox flex />
    <hbox class="attachments">
      {#if $attachments.hasItems}
        <AttachmentIcon size="14px" />
      {/if}
    </hbox>
    <hbox class="star button" class:starred={$message.isStarred}>
      <Button
        icon={StarIcon}
        iconSize="16px"
        iconOnly
        label="Remember this message"
        on:click={() => catchErrors(toggleStar)}
        plain
        />
    </hbox>
    <hbox class="unread button">
      <Button
        icon={CircleIcon}
        iconSize="7px"
        iconOnly
        label={message.isRead ? "Mark this message as unread" : "Mark this message as read"}
        on:click={() => catchErrors(toggleRead)}
        plain
        />
    </hbox>
  </hbox>
</vbox>

<script lang="ts">
  import type { EMail } from "../../../logic/Mail/EMail";
  import { onDragStartMail } from "../Message/drag";
  import Button from "../../Shared/Button.svelte";
  import StarIcon from "lucide-svelte/icons/star";
  import CircleIcon from "lucide-svelte/icons/circle";
  import AttachmentIcon from "lucide-svelte/icons/paperclip";
  import { getDateString } from "../../Util/date";
  import { catchErrors } from "../../Util/error";

  export let message: EMail;

  $: attachments = message.attachments;

  async function toggleRead() {
    await message.markRead(!message.isRead);
  }
  async function toggleStar() {
    await message.markStarred(!message.isStarred);
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
    min-width: 8em;
    justify-content: start;
    font-size: 12px !important;
    font-family: Helvetica, Arial, sans-serif;
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
    stroke: none;
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
