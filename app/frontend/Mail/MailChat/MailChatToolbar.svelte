<hbox class="reply">
  <Button
    icon={ReplyIcon}
    iconSize="24px"
    iconOnly
    label={"Reply to author"}
    onClick={reply}
    plain
    />
</hbox>
<hbox class="reply-all">
  <Button
    icon={ReplyAllIcon}
    iconSize="24px"
    iconOnly
    label={"Reply to all"}
    onClick={replyAll}
    plain
    />
</hbox>
<hbox class="unread" class:read={$message.isRead}>
  <Button
    icon={CircleIcon}
    iconSize="16px"
    iconOnly
    label={$message.isRead ? "Mark this message as unread" : "Mark this message as read"}
    onClick={toggleRead}
    plain
    />
</hbox>
<hbox class="star" class:starred={$message.isStarred}>
  <Button
    icon={StarIcon}
    iconSize="20px"
    iconOnly
    label="Remember this message"
    onClick={toggleStar}
    plain
    />
</hbox>
<hbox class="menu">
  <hbox class="menu-inner">
    <MessageMenu {message} padding={0} />
  </hbox>
</hbox>

<script lang="ts">
  import type { EMail } from "../../../logic/Mail/EMail";
  import { mailMustangApp } from "../MailMustangApp";
  import MessageMenu from "../Message/MessageMenu.svelte";
  import Button from "../../Shared/Button.svelte";
  import StarIcon from "lucide-svelte/icons/star";
  import CircleIcon from "lucide-svelte/icons/circle";
  import ReplyIcon from "lucide-svelte/icons/reply";
  import ReplyAllIcon from "lucide-svelte/icons/reply-all";

  export let message: EMail;

  /* <copied from="MessageToolbar.svelte" /> */

  async function toggleRead() {
    await message.markRead(!message.isRead);
  }
  async function toggleStar() {
    await message.markStarred(!message.isStarred);
  }
  function reply() {
    let reply = message.replyToAuthor();
    mailMustangApp.writeMail(reply);
  }
  function replyAll() {
    let reply = message.replyAll();
    mailMustangApp.writeMail(reply);
  }
</script>

<style>
  .star.starred :global(svg) {
    fill: orange;
  }
  .unread:not(.read) :global(svg) {
    fill: green;
  }
  .menu {
    width: 16px;
    height: 16px;
    padding-bottom: 12px;
    padding-right: 12px;
  }
  .menu-inner {
    position: fixed;
  }
</style>
