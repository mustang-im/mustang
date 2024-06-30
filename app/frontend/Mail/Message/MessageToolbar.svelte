<hbox class="buttons">
  <hbox class="reply">
    <Button
      icon={ReplyIcon}
      iconSize="24px"
      iconOnly
      label={$t`Reply to author`}
      onClick={reply}
      plain
      />
  </hbox>
  <hbox class="reply-all">
    <Button
      icon={ReplyAllIcon}
      iconSize="24px"
      iconOnly
      label={$t`Reply to all`}
      onClick={replyAll}
      plain
      />
  </hbox>
  <hbox class="trash">
    <Button
      icon={TrashIcon}
      iconSize="16px"
      iconOnly
      label={$t`Delete this message`}
      onClick={deleteMessage}
      disabled={!message}
      plain
      />
  </hbox>
  <hbox class="spam">
    <Button
      icon={SpamIcon}
      iconSize="16px"
      iconOnly
      label={"Mark as spam"}
      onClick={markAsSpam}
      disabled={!message}
      plain
      />
  </hbox>
  <hbox class="unread" class:read={$message.isRead}>
    <Button
      icon={CircleIcon}
      iconSize="16px"
      iconOnly
      label={$message.isRead ? $t`Mark this message as unread` : $t`Mark this message as read`}
      onClick={toggleRead}
      plain
      />
  </hbox>
  <hbox class="star" class:starred={$message.isStarred}>
    <Button
      icon={StarIcon}
      iconSize="20px"
      iconOnly
      label={$t`Remember this message`}
      onClick={toggleStar}
      plain
      />
  </hbox>
  <hbox>
    <MessageMenu {message} />
  </hbox>
</hbox>

<script lang="ts">
  import type { EMail } from "../../../logic/Mail/EMail";
  import { mailMustangApp } from "../MailMustangApp";
  import MessageMenu from "./MessageMenu.svelte";
  import Button from "../../Shared/Button.svelte";
  import StarIcon from "lucide-svelte/icons/star";
  import CircleIcon from "lucide-svelte/icons/circle";
  import ReplyIcon from "lucide-svelte/icons/reply";
  import ReplyAllIcon from "lucide-svelte/icons/reply-all";
  import TrashIcon from "lucide-svelte/icons/trash-2";
  import SpamIcon from "lucide-svelte/icons/shield-x";
  import { t } from "../../../l10n/l10n";

  export let message: EMail;

  /* <copied to="MailChatToolbar.svelte" /> */

  async function toggleRead() {
    await message.markRead(!message.isRead);
  }
  async function toggleStar() {
    await message.markStarred(!message.isStarred);
  }
  function reply() {
    let reply = message.action.replyToAuthor();
    mailMustangApp.writeMail(reply);
  }
  function replyAll() {
    let reply = message.action.replyAll();
    mailMustangApp.writeMail(reply);
  }
  async function deleteMessage() {
    await message.deleteMessage();
  }
  async function markAsSpam() {
    await message.treatSpam(true);
  }
</script>

<style>
  .buttons {
    justify-content: end;
    margin-block-end: 8px;
  }
  .buttons > * {
    margin-inline-start: 2px;
  }
  .buttons :global(svg) {
    stroke-width: 1.5px;
  }
  .star.starred :global(svg) {
    fill: orange;
  }
  .unread:not(.read) :global(svg) {
    fill: green;
  }
</style>
