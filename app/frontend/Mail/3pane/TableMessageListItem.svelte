<hbox class="unread button" class:read={$message.isRead}>
  <Button
    icon={CircleIcon}
    iconSize="7px"
    iconOnly
    label={message.isRead ? "Mark this message as unread" : "Mark this message as read"}
    on:click={() => catchErrors(toggleRead)}
    plain
    />
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
<hbox class="attachment button">
  {#if $message.attachments.hasItems}
    <AttachmentIcon size="12px" />
  {/if}
</hbox>
<hbox class="correspondent" draggable="true" on:dragstart={(event) => catchErrors(() => onDragStartMail(event, message))}>{$message.contact.name}</hbox>
<hbox class="subject" class:unread={!$message.isRead} draggable="true" on:dragstart={(event) => catchErrors(() => onDragStartMail(event, message))}>{$message.subject}</hbox>
<hbox class="date" class:unread={!$message.isRead} draggable="true" on:dragstart={(event) => catchErrors(() => onDragStartMail(event, message))}>{getDateString($message.sent)}</hbox>
<hbox class="buttons hover">
  <hbox class="spam button">
    <Button
      icon={SpamIcon}
      iconSize="16px"
      iconOnly
      label="Mark as spam and delete"
      on:click={() => catchErrors(markAsSpam)}
      plain
      />
  </hbox>
  <hbox class="delete button">
    <Button
      icon={DeleteIcon}
      iconSize="16px"
      iconOnly
      label="Delete this message"
      on:click={() => catchErrors(deleteMessage)}
      plain
      />
  </hbox>
</hbox>

<script lang="ts">
  import type { EMail } from "../../../logic/Mail/EMail";
  import { selectedMessage } from "../Selected";
  import Button from "../../Shared/Button.svelte";
  import StarIcon from "lucide-svelte/icons/star";
  import CircleIcon from "lucide-svelte/icons/circle";
  import AttachmentIcon from "lucide-svelte/icons/paperclip";
  import DeleteIcon from "lucide-svelte/icons/trash-2";
  import SpamIcon from "lucide-svelte/icons/shield-x";
  import { getDateString } from "../../Util/date";
  import { catchErrors } from "../../Util/error";
  import { onDragStartMail } from "../Message/drag";

  export let message: EMail;

  async function toggleRead() {
    await message.markRead(!message.isRead);
  }
  async function toggleStar() {
    await message.markStarred(!message.isStarred);
  }
  async function deleteMessage() {
    await message.deleteMessage();
    $selectedMessage = message.nextMessage();
  }
  async function markAsSpam() {
    await message.markSpam(true);
    await message.deleteMessage();
    $selectedMessage = message.nextMessage();
  }
</script>

<style>
  .correspondent,
  .subject {
    white-space: nowrap;
  }
  .date,
  .buttons.hover {
    margin-right: 16px;
  }
  .date {
    min-width: 8em;
    justify-content: start;
    font-size: 12px !important;
    font-family: Helvetica, Arial, sans-serif;
  }
  .subject.unread,
  .date.unread {
    font-weight: bold;
  }
  .buttons.hover {
    justify-content: end;
  }
  :global(.row:not(:hover)) .buttons.hover {
    display: none;
  }
  :global(.row:hover) .date {
    display: none;
  }
  .button {
    width: 20px;
    align-items: center;
  }

  /* <copied to="VerticalMessageListItem.svelte"> */
  .button:hover {
    background-color: var(--selected-hover-bg);
    color: var(--selected-hover-fg);
  }
  :global(.row.selected:hover) .button:hover {
    background-color: var(--hover-bg);
    color: var(--hover-fg);
  }
  .button :global(button) {
    background-color: unset !important;
    color: unset !important;
  }
  .star :global(svg) {
    stroke-width: 1px;
  }
  .buttons.hover :global(svg),
  .unread :global(svg) {
    stroke-width: 1.5px;
  }
  :global(.row:not(:hover)) .unread :global(svg),
  :global(.row:not(:hover)) .star :global(svg) {
    stroke: none;
  }
  :global(.row:not(:hover)) .star:not(.starred) :global(svg) {
    display: none;
  }
  :global(.row:not(:hover)) .unread.read :global(svg) {
    display: none;
  }
  .star.starred :global(svg) {
    fill: orange;
  }
  .unread:not(.read) :global(svg) {
    fill: green;
  }
  /* </copied> */
</style>
