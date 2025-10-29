<vbox class="message"
  class:unread={!$message.isRead}
  draggable="true" on:dragstart={(event) => catchErrors(() => onDragStartMail(event, message))}
  on:contextmenu={contextMenu.onContextMenu}
  on:click
  on:swiperight={deleteMessage}
  on:swipeleft={markAsSpam}
  bind:this={popupAnchor}
  >
  <hbox class="top-row"
    style="border-color: {message.folder.account.color};"
    >
    <hbox class="direction">
      {#if $message.outgoing}
        <OutgoingIcon size={16} class="outgoing" />
      {:else if $message.isReplied}
        <ReplyIcon size={16} class="reply" />
      {/if}
    </hbox>
    <hbox class="contact font-small">{contactName}</hbox>
    <hbox flex />
    {#if $tags.hasItems}
      <hbox class="tags">
        <TagSelector tags={$tags} object={message} canAdd={false} />
      </hbox>
    {/if}
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
    <hbox class="date font-smallest">{getDateTimeString($message.sent)}</hbox>
    <hbox class="unread-dot button" class:unread={!$message.isRead}>
      <Button
        icon={CircleIcon}
        iconSize="7px"
        iconOnly
        label={$message.isRead ? $t`Mark this message as unread` : $t`Mark this message as read`}
        onClick={toggleRead}
        plain
        />
    </hbox>
    <!--
    <hbox class="buttons hover">
      <hbox class="spam button">
        <Button
          icon={SpamIcon}
          iconSize="16px"
          iconOnly
          label={$t`Mark as spam`}
          tooltip={$t`Treat this email as spam: Move it to the Spam folder, and train the spam filter`}
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
    -->
  </hbox>
  <hbox class="bottom-row"
    style="border-color: {message.folder.account.color};"
    >
    <hbox class="subject font-small">{$message.subject}</hbox>
    <hbox flex />
    {#if !isMobile}
      <hbox class="move button">
        <Button
          icon={FolderActionsIcon}
          iconSize="16px"
          iconOnly
          label={$t`Move, tag, or delete`}
          onClick={onPopupToggle}
          plain
          />
      </hbox>
    {/if}
    <hbox class="attachments">
      {#if $message.hasVisibleAttachments}
        <AttachmentIcon size="14px" />
      {/if}
    </hbox>
  </hbox>
</vbox>
<ContextMenu bind:this={contextMenu}>
  <MessageMenu {message} />
</ContextMenu>
<Popup bind:popupOpen {popupAnchor} placement="bottom-end" boundaryElSel=".message-list-pane">
  {#if $selectedMessages.length > 1 && $selectedMessages.contains(message)}
    <MessageMovePopup messages={$selectedMessages} on:close={onPopupClose} bind:selectedMessage={message} />
  {:else}
    <MessageMovePopup messages={new ArrayColl([message])} on:close={onPopupClose} bind:selectedMessage={message} />
  {/if}
</Popup>

<script lang="ts">
  import type { EMail } from "../../../logic/Mail/EMail";
  import { personDisplayName } from "../../../logic/Abstract/PersonUID";
  import { onDragStartMail } from "../Message/drag";
  import { selectedMessages } from "../Selected";
  import TagSelector from "../../Shared/Tag/TagSelector.svelte";
  import MessageMenu from "../Message/MessageMenu.svelte";
  import MessageMovePopup from "../Message/MessageMovePopup.svelte";
  import Popup from "../../Shared/Popup.svelte";
  import ContextMenu from "../../Shared/Menu/ContextMenu.svelte";
  import Button from "../../Shared/Button.svelte";
  import OutgoingIcon from "lucide-svelte/icons/arrow-big-left";
  import ReplyIcon from "lucide-svelte/icons/reply";
  import StarIcon from "lucide-svelte/icons/star";
  import CircleIcon from "lucide-svelte/icons/circle";
  import AttachmentIcon from "lucide-svelte/icons/paperclip";
  import FolderActionsIcon from "lucide-svelte/icons/folder-dot";
  import DeleteIcon from "lucide-svelte/icons/trash-2";
  import SpamIcon from "lucide-svelte/icons/shield-x";
  import { isMobile } from "../../../logic/build";
  import { getDateTimeString } from "../../Util/date";
  import { catchErrors } from "../../Util/error";
  import { ArrayColl } from "svelte-collections";
  import { t } from "../../../l10n/l10n";

  export let message: EMail;

  $: tags = message.tags;
  $: contactName = personDisplayName($message.contact);

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

  let contextMenu: ContextMenu;

  // Popup
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
  .message {
    padding: 12px 18px 12px 18px !important;
    justify-content: baseline;
    align-items: baseline;
  }
  .top-row,
  .bottom-row {
    width: 100%;
    overflow: hidden;
    padding-inline-start: 10px;
    border-left: 3px solid;
  }
  .top-row {
    height: 1.5em;
  }
  .bottom-row {
    height: 1.3em;
  }
  .contact {
    font-weight: 500;
  }
  .subject,
  .date {
    font-weight: 300;
  }
  .unread .contact,
  .unread .subject,
  .unread .date {
    font-weight: 700;
  }
  .date {
    min-width: 8em;
    justify-content: end;
    font-family: Helvetica, Arial, sans-serif;
    padding-top: 2px; /** HACK Fix vertical alignment */
  }
  .subject {
    line-height: 1.3;
  }
  .star {
    margin-inline-end: 8px;
  }
  .attachments {
    align-self: center;
    justify-self: center;
    opacity: 60%;
    width: 16px;
  }
  /*
  :global(.row:not(:hover)) .buttons.hover {
    display: none;
  }
  :global(.row:hover) .date {
    display: none;
  }
  */
  .button {
    width: 20px;
    vertical-align: bottom;
  }
  .direction > :global(*) {
    margin-inline-end: 4px;
  }

  /* <copied from="TableMessageListItem.svelte"> */
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
  .direction :global(svg.outgoing) {
    stroke-width: 1px;
    color: darkred;
  }
  .direction :global(svg.reply) {
    stroke-width: 1px;
    color: grey;
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
  .tags :global(.tag) {
    margin: 0 2px;
    min-height: unset;
    border: none;
  }
  /* </copied> */
  .tags {
    margin-inline-end: 8px;
  }
  .move.button {
    margin-inline-end: 8px;
  }
  .move.button :global(svg) {
    stroke-width: 1px;
  }
  :global(.row:not(:hover)) .move.button {
    display: none;
  }
</style>
