<hbox class="buttons">
  <hbox class="reply">
    <Button
      icon={ReplyIcon}
      iconSize="24px"
      iconOnly
      label={"Reply to author"}
      on:click={() => catchErrors(() => reply())}
      plain
      />
  </hbox>
  <hbox class="reply-all">
    <Button
      icon={ReplyAllIcon}
      iconSize="24px"
      iconOnly
      label={"Reply to all"}
      on:click={() => catchErrors(() => replyAll())}
      plain
      />
  </hbox>
  <hbox class="trash">
    <Button
      icon={TrashIcon}
      iconSize="16px"
      iconOnly
      label={"Delete this message"}
      on:click={() => catchErrors(() => deleteMessage())}
      plain
      />
  </hbox>
  <hbox class="spam">
    <Button
      icon={SpamIcon}
      iconSize="16px"
      iconOnly
      label={"Mark as spam"}
      on:click={() => catchErrors(() => markAsSpam())}
      plain
      />
  </hbox>
  <hbox class="unread" class:read={$message.read}>
    <Button
      icon={CircleIcon}
      iconSize="16px"
      iconOnly
      label={message.read ? "Mark this message as unread" : "Mark this message as read"}
      on:click={() => catchErrors(() => toggleRead())}
      plain
      />
  </hbox>
  <hbox class="star" class:starred={$message.starred}>
    <Button
      icon={StarIcon}
      iconSize="20px"
      iconOnly
      label="Remember this message"
      on:click={() => catchErrors(() => toggleStar())}
      plain
      />
  </hbox>
  <hbox>
    <MessageMenu {message} {account} />
  </hbox>
</hbox>

<script lang="ts">
  //import type { Email } from "mustang-lib";
  import type { EMail } from "../../../logic/Mail/Message";
  import type { MailAccount } from "../../../logic/Mail/Account";
  import { mailMustangApp } from "../MailMustangApp";
  import MessageMenu from "./MessageMenu.svelte";
  import Button from "../../Shared/Button.svelte";
  import StarIcon from "lucide-svelte/icons/star";
  import CircleIcon from "lucide-svelte/icons/circle";
  import ReplyIcon from "lucide-svelte/icons/reply";
  import ReplyAllIcon from "lucide-svelte/icons/reply-all";
  import TrashIcon from "lucide-svelte/icons/trash-2";
  import SpamIcon from "lucide-svelte/icons/shield-x";
  import { catchErrors } from "../../Util/error";

  export let message: EMail;
  export let account: MailAccount;

  function toggleRead() {
    message.read = !message.read;
  }
  function toggleStar() {
    message.starred = !message.starred;
  }
  function reply() {
    let reply = message.replyToAuthor();
    mailMustangApp.writeMail(reply);
  }
  function replyAll() {
    let reply = message.replyAll();
    mailMustangApp.writeMail(reply);
  }
  async function deleteMessage() {
    await message.deleteMessage();
  }
  async function markAsSpam() {
    await message.deleteMessage();
  }
</script>

<style>
  .buttons {
    justify-content: end;
    margin-bottom: 8px;
  }
  .buttons > * {
    margin-left: 8px;
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
