<hbox class="attachment">
  {#if $message.attachments.hasItems}
    <AttachmentIcon size="12px" />
  {/if}
</hbox>
<hbox class="star button" class:starred={$message.isStarred}>
  <Button
    icon={StarIcon}
    iconSize="16px"
    iconOnly
    label={$t`Remember this message`}
    onClick={toggleStar}
    plain
    />
</hbox>
<hbox class="unread-dot button" class:unread={!$message.isRead}>
  <Button
    icon={CircleIcon}
    iconSize="7px"
    iconOnly
    label={message.isRead ? $t`Mark this message as unread` : $t`Mark this message as read`}
    onClick={toggleRead}
    plain
    />
</hbox>
<hbox class="direction">
  {#if message.outgoing}
    <OutgoingIcon size={16} />
  {/if}
</hbox>
<hbox class="correspondent" draggable="true" on:dragstart={(event) => catchErrors(() => onDragStartMail(event, message))}>{contactName}</hbox>
<hbox class="subject" class:unread={!$message.isRead} draggable="true" on:dragstart={(event) => catchErrors(() => onDragStartMail(event, message))}>{$message.subject}</hbox>
<hbox class="date" class:unread={!$message.isRead} draggable="true" on:dragstart={(event) => catchErrors(() => onDragStartMail(event, message))}>{getDateString($message.sent)}</hbox>
<hbox class="buttons hover">
  <hbox class="spam button">
    <Button
      icon={SpamIcon}
      iconSize="16px"
      iconOnly
      label={$t`Mark as spam and delete`}
      onClick={markAsSpam}
      plain
      />
  </hbox>
  <hbox class="delete button">
    <Button
      icon={DeleteIcon}
      iconSize="16px"
      iconOnly
      label={$t`Delete this message`}
      onClick={deleteMessage}
      plain
      />
  </hbox>
</hbox>

<script lang="ts">
  import type { EMail } from "../../../logic/Mail/EMail";
  import { personDisplayName } from "../../../logic/Abstract/PersonUID";
  import { onDragStartMail } from "../Message/drag";
  import Button from "../../Shared/Button.svelte";
  import OutgoingIcon from "lucide-svelte/icons/arrow-big-left";
  import StarIcon from "lucide-svelte/icons/star";
  import CircleIcon from "lucide-svelte/icons/circle";
  import AttachmentIcon from "lucide-svelte/icons/paperclip";
  import DeleteIcon from "lucide-svelte/icons/trash-2";
  import SpamIcon from "lucide-svelte/icons/shield-x";
  import { getDateString } from "../../Util/date";
  import { catchErrors } from "../../Util/error";
  import { t } from "../../../l10n/l10n";

  export let message: EMail;

  $: contactName = personDisplayName(message.contact);

  async function toggleRead() {
    await message.markRead(!message.isRead);
  }
  async function toggleStar() {
    await message.markStarred(!message.isStarred);
  }
  async function deleteMessage() {
    await message.deleteMessage();
  }
  async function markAsSpam() {
    await message.treatSpam(true);
  }
</script>

<style>
  .correspondent,
  .subject {
    white-space: nowrap;
  }
  .date,
  .buttons.hover {
    margin-inline-end: 16px;
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
    justify-content: start;
  }
  :global(.row:not(:hover)) .buttons.hover {
    display: none;
  }
  :global(.row:hover) .date {
    display: none;
  }
  .button {
    width: 16px;
    padding: 0px 4px 0px 0px;
    align-items: center;
  }
  .attachment {
    width: 16px;
    padding: 4px 0px 0px 8px;
  }
  .direction {
    width: 16px;
    padding: 0px 0px 0px 0px;
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
  .direction {
    align-items: center;
  }
  .direction :global(svg) {
    stroke-width: 1px;
    color: darkred;
  }
  .star :global(svg) {
    stroke-width: 1px;
  }
  .buttons.hover :global(svg),
  .unread-dot :global(svg) {
    stroke-width: 1.5px;
  }
  :global(.row:not(:hover)) .unread-dot :global(svg),
  :global(.row:not(:hover)) .star :global(svg) {
    stroke: none;
  }
  :global(.row:not(:hover)) .star:not(.starred) :global(svg) {
    display: none;
  }
  :global(.row:not(:hover)) .unread-dot:not(.unread) :global(svg) {
    display: none;
  }
  .star.starred :global(svg) {
    fill: orange;
  }
  .unread-dot.unread :global(svg) {
    fill: green;
  }
  /* </copied> */
</style>
