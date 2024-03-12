<hbox class="unread button" class:read={$message.read}>
  <Button
    icon={CircleIcon}
    iconSize="10px"
    iconOnly
    label={message.read ? "Mark this message as unread" : "Mark this message as read"}
    on:click={() => catchErrors(toggleRead)}
    plain
    />
</hbox>
<hbox class="star button" class:starred={$message.starred}>
  <Button
    icon={StarIcon}
    iconSize="14px"
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
<hbox class="correspondent">{$message.contact.name}</hbox>
<hbox class="subject" class:unread={!$message.read}>{$message.subject}</hbox>
<hbox class="date" class:unread={!$message.read}>{getDateString($message.sent)}</hbox>

<script lang="ts">
  import type { EMail } from "../../../logic/Mail/EMail";
  import Button from "../../Shared/Button.svelte";
  import StarIcon from "lucide-svelte/icons/star";
  import CircleIcon from "lucide-svelte/icons/circle";
  import AttachmentIcon from "lucide-svelte/icons/paperclip";
  import { getDateString } from "../../Util/date";
  import { catchErrors } from "../../Util/error";

  export let message: EMail;

  async function toggleRead(message: EMail) {
    message.markRead(!message.read);
  }
  async function toggleStar(message: EMail) {
    message.markStarred(!message.starred);
  }
</script>

<style>
  .correspondent,
  .subject {
    white-space: nowrap;
  }
  .date {
    min-width: 8em;
    justify-content: center;
  }
  .subject.unread,
  .date.unread {
    font-weight: bold;
  }
  .button {
    width: 20px;
    align-items: center;
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
  :global(.row:not(:hover)) .unread.read :global(svg) {
    opacity: 0;
  }
  .unread:not(.read) :global(svg) {
    fill: green;
  }
</style>
