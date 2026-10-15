<vbox class="reading-header">
  <hbox class="subject-row">
    <h2 class="subject" title={$message.subject}>{$message.subject || $t`(no subject)`}</h2>
  </hbox>
  <hbox class="sender-row">
    <PersonCircle name={personDisplayName($message.from)} picture={$message.from?.findPerson()?.picture}
      colorKey={$message.from?.emailAddress} size={40} title={personDisplayName($message.from)} />
    <vbox flex class="sender-info">
      <hbox class="from">
        <hbox class="sender-name">
          <Recipient recipient={$message.from} />
        </hbox>
        {#if $message.from?.emailAddress && $message.from.findPerson()}
          <span class="sender-address">&lt;{$message.from.emailAddress}&gt;</span>
        {/if}
        <EncryptionButtons {message} bind:isExpanded={isEncryptionExpanded} />
      </hbox>
      {#if $to.hasItems}
        <hbox class="recipients">
          <span class="recipients-label">{$t`To:`}</span>
          <RecipientsList recipients={$to} />
        </hbox>
      {/if}
      {#if $cc.hasItems}
        <hbox class="recipients">
          <span class="recipients-label">{$t`Cc:`}</span>
          <RecipientsList recipients={$cc} />
        </hbox>
      {/if}
      {#if $bcc.hasItems}
        <hbox class="recipients">
          <span class="recipients-label">{$t`Bcc:`}</span>
          <RecipientsList recipients={$bcc} />
        </hbox>
      {/if}
    </vbox>
    <vbox class="top-right">
      <hbox class="respond-group">
        <hbox class="button-group">
          <button class="respond" on:click={() => MessageActions.reply(message)}
            title={$t`Reply`} aria-label={$t`Reply`}>
            <ReplyIcon size={18} />
          </button>
          <button class="respond" on:click={() => MessageActions.replyAll(message)}
            disabled={!MessageActions.canReplyAll(message)}
            title={$t`Reply All`} aria-label={$t`Reply All`}>
            <ReplyAllIcon size={18} />
          </button>
          <button class="respond" on:click={event => catchErrors(() => MessageActions.forward(message, event))}
            title={$t`Forward`} aria-label={$t`Forward`}>
            <ForwardIcon size={18} />
          </button>
        </hbox>
        <button class="more" bind:this={moreEl} on:click={() => isMoreOpen = !isMoreOpen}
          title={$t`More actions`} aria-label={$t`More actions`} aria-haspopup="menu">
          <MoreIcon size={18} />
        </button>
      </hbox>
      <span class="date" title={$message.received ? $t`Received: ${MessageDates.fullDate($message.received)}` : null}>
        {MessageDates.fullDate($message.sent)}
      </span>
    </vbox>
  </hbox>
  {#if $tags.hasItems}
    <hbox class="categories">
      {#each $tags.each as tag (tag)}
        <span class="category" style="--category-color: {tag.color};">
          {tag.name}
          <button class="remove-category" on:click={() => catchErrors(() => message.removeTag(tag))}
            title={$t`Remove category ${tag.name}`} aria-label={$t`Remove category ${tag.name}`}>
            <RemoveIcon size={12} />
          </button>
        </span>
      {/each}
    </hbox>
  {/if}
  {#if isEncryptionExpanded}
    <EncryptionDetails {message} bind:isExpanded={isEncryptionExpanded} />
  {/if}
  {#if message.to.isEmpty || message.from.emailAddress == kDummyPerson.emailAddress}
    <!-- <copied from="../../../frontend/Mail/Message/MessageHeader.svelte"> -->
    {#await message.loadForDisplay() catch ex}
      <ErrorMessageInline {ex} />
    {/await}
    <!-- </copied> -->
  {/if}
</vbox>
<Menu bind:isMenuOpen={isMoreOpen} anchor={moreEl} placement="bottom-end">
  <MenuItem label={$t`Reply`} icon={ReplyIcon} onClick={() => MessageActions.reply(message)} />
  <MenuItem label={$t`Reply All`} icon={ReplyAllIcon}
    disabled={!MessageActions.canReplyAll(message) && $t`There are no other recipients`}
    onClick={() => MessageActions.replyAll(message)} />
  <MenuItem label={$t`Forward`} icon={ForwardIcon} onClick={event => MessageActions.forward(message, event as MouseEvent)} />
  <MenuItem label={$t`Forward as Attachment`} icon={ForwardAttachmentIcon} onClick={() => MessageActions.forwardAsAttachment(message)} />
  <MenuItem label={$t`Redirect`} icon={RedirectIcon}
    tooltip={$t`Send this message to somebody else, who can reply to the original sender`}
    onClick={() => MessageActions.redirect(message)} />
  {#if $message.outgoing}
    <MenuItem label={$t`Edit as New`} icon={EditAsNewIcon} onClick={() => MessageActions.editAsNew(message)} />
  {/if}
  <MenuItem label={$t`New Topic to All`} icon={NewToAllIcon}
    tooltip={$t`Send a new, unrelated message to all recipients`}
    onClick={() => MessageActions.newToAll(message)} />
  <MenuDivider />
  <MenuItem label={$t`Delete`} icon={DeleteIcon} onClick={() => MessageActions.delete([message])} />
  <MenuItem label={$message.isRead ? $t`Mark as Unread` : $t`Mark as Read`} icon={$message.isRead ? UnreadIcon : ReadIcon}
    onClick={() => MessageActions.markRead([message], !message.isRead)} />
  <MenuItem label={$message.isStarred ? $t`Clear Flag` : $t`Flag Message`} icon={$message.isStarred ? ClearFlagIcon : FlagIcon}
    onClick={() => MessageActions.flag([message], !message.isStarred)} />
  <SubMenuItem label={$t`Categorize`} icon={CategorizeIcon}>
    <CategorizeMenuItems messages={[message]} />
  </SubMenuItem>
  <MenuDivider />
  <MenuItem label={$t`Print`} icon={PrintIcon} onClick={() => MessageActions.print(message)} />
  <MenuItem label={$t`Save As…`} icon={SaveIcon} onClick={() => MessageActions.saveAs(message)} />
  <MenuItem label={$contentRendering.value == "source" ? $t`View Message` : $t`View Source`} icon={SourceIcon}
    onClick={() => MessageActions.toggleSource()} />
</Menu>

<script lang="ts">
  import type { EMail } from "../../../logic/Mail/EMail";
  import { kDummyPerson, personDisplayName } from "../../../logic/Abstract/PersonUID";
  import { MessageActions } from "../MessageActions";
  import { MessageDates } from "../MessageList/MessageDates";
  import { MailView } from "../MailView";
  import PersonCircle from "../../Shared/Person/PersonCircle.svelte";
  import SubMenuItem from "../Menu/SubMenuItem.svelte";
  import CategorizeMenuItems from "../Menu/CategorizeMenuItems.svelte";
  import Recipient from "../../../frontend/Mail/Message/Recipient.svelte";
  import RecipientsList from "../../../frontend/Mail/Message/RecipientsList.svelte";
  import EncryptionButtons from "../../../frontend/Mail/Message/EncryptionButtons.svelte";
  import EncryptionDetails from "../../../frontend/Mail/Message/EncryptionDetails.svelte";
  import ErrorMessageInline from "../../../frontend/Shared/ErrorMessageInline.svelte";
  import Menu from "../../../frontend/Shared/Menu/Menu.svelte";
  import MenuItem from "../../../frontend/Shared/Menu/MenuItem.svelte";
  import MenuDivider from "../../../frontend/Shared/Menu/MenuDivider.svelte";
  import ReplyIcon from "lucide-svelte/icons/reply";
  import ReplyAllIcon from "lucide-svelte/icons/reply-all";
  import ForwardIcon from "lucide-svelte/icons/forward";
  import ForwardAttachmentIcon from "lucide-svelte/icons/paperclip";
  import RedirectIcon from "lucide-svelte/icons/move-right";
  import EditAsNewIcon from "lucide-svelte/icons/iteration-ccw";
  import NewToAllIcon from "lucide-svelte/icons/plus";
  import MoreIcon from "lucide-svelte/icons/ellipsis";
  import DeleteIcon from "lucide-svelte/icons/trash-2";
  import ReadIcon from "lucide-svelte/icons/mail-open";
  import UnreadIcon from "lucide-svelte/icons/mail";
  import FlagIcon from "lucide-svelte/icons/flag";
  import ClearFlagIcon from "lucide-svelte/icons/flag-off";
  import CategorizeIcon from "lucide-svelte/icons/tag";
  import PrintIcon from "lucide-svelte/icons/printer";
  import SaveIcon from "lucide-svelte/icons/save";
  import SourceIcon from "lucide-svelte/icons/code-xml";
  import RemoveIcon from "lucide-svelte/icons/x";
  import { catchErrors } from "../../../frontend/Util/error";
  import { t } from "../../../l10n/l10n";

  export let message: EMail;

  const contentRendering = MailView.contentRendering;
  $: to = message.to;
  $: cc = message.cc;
  $: bcc = message.bcc;
  $: tags = message.tags;

  let isEncryptionExpanded = false;
  $: $message, isEncryptionExpanded = false;

  let moreEl: HTMLButtonElement;
  let isMoreOpen = false;
</script>

<style>
  .reading-header {
    flex-shrink: 0;
    padding: 16px 20px 12px 20px;
    gap: 12px;
  }
  .subject {
    margin: 0;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 20px;
    font-weight: 600;
    line-height: 1.3;
    overflow-wrap: anywhere;
  }
  .sender-row {
    align-items: start;
    gap: 12px;
  }
  .sender-info {
    min-width: 0;
    gap: 2px;
  }
  .from {
    align-items: center;
    gap: 6px;
    min-width: 0;
  }
  .sender-name {
    flex: 0 1 auto;
    min-width: 0;
    overflow: hidden;
    font-weight: 600;
    white-space: nowrap;
  }
  .sender-address {
    flex: 0 1 auto;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .sender-name :global(.domain) {
    color: var(--lo-fg-secondary);
    font-style: normal;
  }
  .sender-address {
    color: var(--lo-fg-secondary);
  }
  .recipients {
    align-items: baseline;
    gap: 6px;
    min-width: 0;
    color: var(--lo-fg-secondary);
    font-size: 13px;
  }
  .recipients-label {
    flex-shrink: 0;
  }
  /* Line breaks only after the commas, never between a name and its comma */
  .recipients :global(.persons) {
    display: block;
    min-width: 0;
    font-size: 0;
    white-space: nowrap;
  }
  .sender-info .recipients :global(.persons > *) {
    display: inline-flex;
    max-width: 100%;
    overflow: hidden;
    vertical-align: baseline;
    font-size: 13px;
    line-height: 20px;
  }
  .sender-info .recipients :global(.persons > .separator) {
    display: inline;
    white-space: normal;
  }
  .sender-info .recipients :global(.persons > .separator::after) {
    content: " ";
  }
  .top-right {
    flex-shrink: 0;
    align-items: end;
    gap: 6px;
  }
  .respond-group {
    gap: 6px;
  }
  .button-group {
    border: 1px solid var(--lo-border);
    border-radius: var(--lo-radius-small);
    overflow: hidden;
  }
  .respond,
  .more {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 32px;
    padding: 0;
    border: none;
    background: none;
    color: var(--lo-accent-text);
    cursor: pointer;
  }
  .respond + .respond {
    border-inline-start: 1px solid var(--lo-border);
  }
  .more {
    border: 1px solid var(--lo-border);
    border-radius: var(--lo-radius-small);
    color: var(--lo-fg-secondary);
  }
  .respond:hover:not(:disabled),
  .more:hover {
    background-color: var(--lo-hover-bg);
  }
  .respond:disabled {
    color: var(--lo-fg-disabled);
    cursor: default;
  }
  .date {
    color: var(--lo-fg-secondary);
    font-size: 12px;
    white-space: nowrap;
  }
  .categories {
    flex-wrap: wrap;
    gap: 6px;
    padding-inline-start: 52px;
  }
  .category {
    display: flex;
    align-items: center;
    gap: 2px;
    padding: 0 2px 0 8px;
    border: 1px solid color-mix(in srgb, var(--category-color) 70%, var(--lo-fg));
    border-radius: 3px;
    background-color: color-mix(in srgb, var(--category-color) 22%, var(--lo-pane-bg));
    font-size: 12px;
    line-height: 20px;
  }
  .remove-category {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    padding: 0;
    border: none;
    border-radius: 2px;
    background: none;
    color: var(--lo-fg-secondary);
    cursor: pointer;
  }
  .remove-category:hover {
    background-color: var(--lo-hover-bg);
    color: var(--lo-fg);
  }
</style>
