<hbox class="buttons">
  {#if message.isDraft || message.folder?.specialFolder == SpecialFolder.Drafts }
    <hbox class="draft">
      <Button
        icon={WriteIcon}
        iconSize="24px"
        label={$t`Edit draft`}
        onClick={editDraft}
        />
    </hbox>
  {/if}
  <hbox class="reply">
    <Button
      icon={ReplyIcon}
      iconSize="22px"
      iconOnly
      label={$t`Reply to author`}
      onClick={reply}
      plain
      />
  </hbox>
  <hbox class="reply-all">
    <Button
      icon={ReplyAllIcon}
      iconSize="22px"
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
      label={$t`Mark as spam`}
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
      iconSize="18px"
      iconOnly
      label={$t`Remember this message`}
      onClick={toggleStar}
      plain
      />
  </hbox>
  <hbox class="move button" bind:this={popupAnchor}>
    <Button
      icon={FolderActionsIcon}
      iconSize="16px"
      iconOnly
      label={$t`Move to folder`}
      onClick={onPopupToggle}
      plain
      />
  </hbox>
  <hbox>
    <MessageMenu {message} />
  </hbox>
</hbox>
<Popup bind:popupOpen {popupAnchor} placement="bottom" boundaryElSel=".message-list-pane">
  <MessageMovePopup messages={new ArrayColl([message])} on:close={onPopupClose} />
</Popup>

<script lang="ts">
  import type { EMail } from "../../../logic/Mail/EMail";
  import { mailMustangApp } from "../MailMustangApp";
  import { SpecialFolder } from "../../../logic/Mail/Folder";
  import MessageMenu from "./MessageMenu.svelte";
  import MessageMovePopup from "../Message/MessageMovePopup.svelte";
  import Popup from "../../Shared/Popup.svelte";
  import Button from "../../Shared/Button.svelte";
  import StarIcon from "lucide-svelte/icons/star";
  import CircleIcon from "lucide-svelte/icons/circle";
  import ReplyIcon from "lucide-svelte/icons/reply";
  import ReplyAllIcon from "lucide-svelte/icons/reply-all";
  import TrashIcon from "lucide-svelte/icons/trash-2";
  import SpamIcon from "lucide-svelte/icons/shield-x";
  import WriteIcon from "lucide-svelte/icons/pencil";
  import FolderActionsIcon from "lucide-svelte/icons/folder-dot";
  import { ArrayColl } from "svelte-collections";
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
  async function editDraft() {
    await message.loadMIME();
    mailMustangApp.writeMail(message);
  }

  // Folder Popup
  let popupAnchor: HTMLElement;
  let popupOpen = false;
  function onPopupToggle(event) {
    popupOpen = !popupOpen;
  }
  function onPopupClose() {
    popupOpen = false;
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
    stroke-width: 1.3px;
  }
  .star.starred :global(svg) {
    fill: orange;
  }
  .unread:not(.read) :global(svg) {
    fill: green;
  }
  hbox.draft {
    margin-right: 32px;
  }
</style>
