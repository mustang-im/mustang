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
{#if recipients.length > 1 && message.bcc.isEmpty}
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
{/if}
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
<hbox class="open">
  <Button
    icon={OpenIcon}
    iconSize="20px"
    iconOnly
    label={$t`Open this message alone`}
    onClick={openMessageAlone}
    plain
    />
</hbox>
<hbox class="open">
  <Button
    icon={OpenIcon}
    iconSize="20px"
    iconOnly
    label={$t`Open this message alone`}
    onClick={openMessageAlone}
    plain
    />
</hbox>
<hbox class="menu button">
  <ButtonMenu bind:isMenuOpen>
    <MessageMenu {message} {printE} />
  </ButtonMenu>
</hbox>

<Print {message} bind:this={printE} />

<script lang="ts">
  import type { EMail } from "../../../logic/Mail/EMail";
  import { mailMustangApp } from "../MailMustangApp";
  import MessageMenu from "../Message/MessageMenu.svelte";
  import Print from "../Message/MessagePrint.svelte";
  import ButtonMenu from "../../Shared/Menu/ButtonMenu.svelte";
  import Button from "../../Shared/Button.svelte";
  import StarIcon from "lucide-svelte/icons/star";
  import CircleIcon from "lucide-svelte/icons/circle";
  import ReplyIcon from "lucide-svelte/icons/reply";
  import ReplyAllIcon from "lucide-svelte/icons/reply-all";
  import OpenIcon from "lucide-svelte/icons/maximize-2";
  import { selectedMessage } from "../Selected";
  import { getLocalStorage } from "../../Util/LocalStorage";
  import { t } from "../../../l10n/l10n";

  export let message: EMail;

  /* <copied from="MessageToolbar.svelte" /> */
  $: recipients = message.allRecipients();

  async function toggleRead() {
    await message.markRead(!message.isRead);
  }
  async function toggleStar() {
    await message.markStarred(!message.isStarred);
  }
  function reply() {
    let reply = message.compose.replyToAuthor();
    mailMustangApp.writeMail(reply);
  }
  function replyAll() {
    let reply = message.compose.replyAll();
    mailMustangApp.writeMail(reply);
  }
  function openMessageAlone() {
    $selectedMessage = message;
    let modeSetting = getLocalStorage("mail.contentRendering", "html");
    modeSetting.value = "html";
  }

  let isMenuOpen = false;
  let printE: Print;
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
    padding-block-end: 12px;
    padding-inline-end: 12px;
  }
  .menu-inner {
    position: fixed;
  }
</style>
