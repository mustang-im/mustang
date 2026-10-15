<!-- svelte-ignore a11y_click_events_have_key_events -->
<div class="message-item"
  class:unread={!$message.isRead}
  class:selected={isSelected}
  class:flagged={$message.isStarred}
  class:deleted={$message.isDeleted}
  role="option"
  tabindex="-1"
  aria-selected={isSelected}
  draggable="true"
  on:dragstart={event => catchErrors(() => onDragStartMail(event, message))}
  on:click
  on:dblclick
  on:contextmenu
  >
  <hbox class="line first-line">
    <span class="sender" title={senderTooltip}>{senderName}</span>
    <hbox flex />
    {#if $tags.hasItems}
      <hbox class="categories">
        {#each $tags.each as tag (tag)}
          <span class="category" style="--category-color: {tag.color};" title={tag.name}>{tag.name}</span>
        {/each}
      </hbox>
    {/if}
    <hbox class="hover-actions">
      <button class="action" tabindex="-1"
        title={$message.isRead ? $t`Mark as Unread` : $t`Mark as Read`}
        on:click|stopPropagation={() => catchErrors(() => message.markRead(!message.isRead))}>
        {#if $message.isRead}
          <UnreadIcon size={16} />
        {:else}
          <ReadIcon size={16} />
        {/if}
      </button>
      <button class="action flag-action" tabindex="-1"
        title={$message.isStarred ? $t`Clear Flag` : $t`Flag this message`}
        on:click|stopPropagation={() => catchErrors(() => message.markStarred(!message.isStarred))}>
        <FlagIcon size={16} />
      </button>
      <button class="action" tabindex="-1"
        title={$t`Delete`}
        on:click|stopPropagation={() => catchErrors(() => MessageActions.delete([message]))}>
        <DeleteIcon size={16} />
      </button>
    </hbox>
  </hbox>
  <hbox class="line second-line">
    {#if isDraft}
      <span class="draft">{$t`[Draft]`}</span>
    {/if}
    <span class="subject" title={$message.subject}>{$message.subject || $t`(no subject)`}</span>
    <hbox flex />
    <hbox class="status-icons">
      {#if $message.isSending}
        <span title={$t`Sending…`}><SendingIcon size={14} class="sending" /></span>
      {/if}
      {#if $message.isImportant}
        <span title={$t`High importance`}><ImportantIcon size={14} class="important" /></span>
      {/if}
      {#if $message.invitationMessage}
        <span title={$t`Meeting request`}><MeetingIcon size={14} /></span>
      {/if}
      {#if $message.wasEncrypted || $message.signedByKeyID}
        <span title={$message.wasEncrypted ? $t`Encrypted` : $t`Signed`}><SecureIcon size={14} /></span>
      {/if}
      {#if $message.hasVisibleAttachments}
        <span title={$t`Has attachments`}><AttachmentIcon size={14} /></span>
      {/if}
      {#if $message.isForwarded}
        <span title={$t`You forwarded this message`}><ForwardedIcon size={14} class="forwarded" /></span>
      {:else if $message.isReplied}
        <span title={$t`You replied to this message`}><RepliedIcon size={14} class="replied" /></span>
      {/if}
      {#if $message.isStarred}
        <span title={$t`Flagged`}><FlagIcon size={14} class="flag" /></span>
      {/if}
    </hbox>
    <span class="date" title={MessageDates.fullDate($message.sent)}>{MessageDates.listDate($message.sent)}</span>
  </hbox>
  {#if previewLines > 0}
    <div class="preview" style="-webkit-line-clamp: {previewLines};">{preview}</div>
  {/if}
</div>

<script lang="ts">
  import type { EMail } from "../../../logic/Mail/EMail";
  import { SpecialFolder } from "../../../logic/Mail/Folder";
  import { onDragStartMail } from "../../../frontend/Mail/Message/drag";
  import { MessageActions } from "../MessageActions";
  import { MessageDates } from "./MessageDates";
  import { ListName } from "./ListName";
  import ReadIcon from "lucide-svelte/icons/mail-open";
  import UnreadIcon from "lucide-svelte/icons/mail";
  import FlagIcon from "lucide-svelte/icons/flag";
  import DeleteIcon from "lucide-svelte/icons/trash-2";
  import SendingIcon from "lucide-svelte/icons/send";
  import ImportantIcon from "lucide-svelte/icons/circle-alert";
  import MeetingIcon from "lucide-svelte/icons/calendar-days";
  import SecureIcon from "lucide-svelte/icons/lock";
  import AttachmentIcon from "lucide-svelte/icons/paperclip";
  import RepliedIcon from "lucide-svelte/icons/reply";
  import ForwardedIcon from "lucide-svelte/icons/forward";
  import { catchErrors } from "../../../frontend/Util/error";
  import { t } from "../../../l10n/l10n";

  export let message: EMail;
  export let isSelected = false;
  export let previewLines = 1;

  $: tags = message.tags;
  $: senderName = $message && ListName.of(message);
  $: senderTooltip = ListName.showsRecipient(message)
    ? $t`To: ${senderName}`
    : $message.from?.emailAddress ?? "";
  $: isDraft = $message.isDraft || message.folder?.specialFolder == SpecialFolder.Drafts;
  $: preview = previewLines > 0 ? ($message.text ?? "").replace(/\s+/g, " ").trim().substring(0, 400) : "";
</script>

<style>
  .message-item {
    position: relative;
    display: flex;
    flex-direction: column;
    height: 100%;
    box-sizing: border-box;
    padding: 7px 12px 7px 16px;
    border-bottom: 1px solid var(--lo-divider);
    color: var(--lo-fg);
    cursor: default;
    user-select: none;
    overflow: hidden;
  }
  .message-item:hover {
    background-color: var(--lo-hover-bg);
  }
  .message-item.selected {
    background-color: var(--lo-selected-bg);
  }
  .message-item.selected:hover {
    background-color: var(--lo-selected-hover-bg);
  }
  .message-item.unread::before,
  .message-item.selected::before {
    content: "";
    position: absolute;
    inset-inline-start: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background-color: var(--lo-accent);
  }
  .message-item.selected:not(.unread)::before {
    width: 3px;
  }
  .message-item.deleted {
    opacity: 0.5;
  }
  .line {
    align-items: center;
    min-width: 0;
    white-space: nowrap;
  }
  .first-line {
    height: 20px;
  }
  .second-line {
    height: 18px;
    font-size: 13px;
  }
  .sender {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 15px;
  }
  .unread .sender {
    font-weight: 600;
  }
  .draft {
    flex-shrink: 0;
    margin-inline-end: 4px;
    color: var(--lo-danger);
  }
  .subject {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .unread .subject {
    color: var(--lo-accent-text);
    font-weight: 600;
  }
  .date {
    flex-shrink: 0;
    margin-inline-start: 8px;
    color: var(--lo-fg-secondary);
    font-size: 12px;
  }
  .unread .date {
    color: var(--lo-accent-text);
    font-weight: 600;
  }
  .status-icons {
    flex-shrink: 0;
    align-items: center;
    gap: 4px;
    margin-inline-start: 6px;
    color: var(--lo-fg-secondary);
  }
  .status-icons span {
    display: flex;
  }
  .status-icons :global(.important),
  .status-icons :global(.flag) {
    color: var(--lo-danger);
  }
  .status-icons :global(.flag) {
    fill: var(--lo-danger);
  }
  .status-icons :global(.replied),
  .status-icons :global(.forwarded) {
    color: var(--lo-accent-text);
  }
  .status-icons :global(.sending) {
    animation: sending 1.5s linear infinite;
  }
  @keyframes sending {
    0% { opacity: 0; transform: translate(-3px, 2px); }
    20% { opacity: 1; }
    80% { opacity: 1; }
    100% { opacity: 0; transform: translate(3px, -2px); }
  }
  .preview {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    overflow: hidden;
    color: var(--lo-fg-secondary);
    font-size: 13px;
    line-height: 18px;
    white-space: normal;
    word-break: break-word;
  }
  .categories {
    flex-shrink: 1;
    min-width: 0;
    gap: 4px;
    margin-inline-start: 8px;
    overflow: hidden;
  }
  .category {
    flex-shrink: 0;
    max-width: 96px;
    padding: 0 6px;
    overflow: hidden;
    text-overflow: ellipsis;
    border: 1px solid color-mix(in srgb, var(--category-color) 70%, var(--lo-fg));
    border-radius: 3px;
    background-color: color-mix(in srgb, var(--category-color) 22%, var(--lo-pane-bg));
    font-size: 11px;
    line-height: 16px;
  }
  .hover-actions {
    display: none;
    flex-shrink: 0;
    gap: 2px;
    margin-inline-start: 6px;
  }
  .message-item:hover .hover-actions {
    display: flex;
  }
  .action {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 22px;
    padding: 0;
    border: none;
    border-radius: var(--lo-radius-small);
    background: none;
    color: var(--lo-fg-secondary);
    cursor: pointer;
  }
  .action:hover {
    background-color: var(--lo-pressed-bg);
    color: var(--lo-fg);
  }
  .flagged .flag-action {
    color: var(--lo-danger);
  }
</style>
