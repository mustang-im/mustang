<hbox class="unread button" class:read={$message.read}>
  <Button
    icon={CircleIcon}
    iconSize="10px"
    iconOnly
    label={message.read ? "Mark this message as unread" : "Mark this message as read"}
    on:click={() => toggleRead(message)}
    plain
    />
</hbox>
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
<hbox class="correspondent">{$message.contact.name}</hbox>
<hbox class="subject" class:unread={!$message.read}>{$message.subject}</hbox>
<hbox class="date" class:unread={!$message.read}>{getDateString($message.received)}</hbox>

<script lang="ts">
  import type { EMail } from "../../../logic/Mail/EMail";
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
    vertical-align: middle;
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
