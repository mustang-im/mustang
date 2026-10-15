<vbox flex class="reading-pane lo-card">
  {#if shownMessage}
    {#key shownMessage}
      <vbox flex class="message">
        <ReadingPaneHeader message={shownMessage} />
        <InfoBars message={shownMessage} />
        <hbox class="attachments">
          <AttachmentsUI attachments={shownMessage.attachments} />
        </hbox>
        {#if MailInvitation.isInvitationMail(shownMessage)}
          <InvitationBar message={shownMessage} />
        {:else}
          <vbox class="sml">
            <SMLDisplayKinds message={shownMessage} sml={shownMessage.sml} />
          </vbox>
        {/if}
        <vbox flex class="body">
          <MessageBody message={shownMessage} />
        </vbox>
      </vbox>
    {/key}
  {:else}
    <vbox flex class="placeholder">
      {#if selectedCount > 1}
        <MultipleIcon size={56} strokeWidth={1} />
        <span class="placeholder-title">{$t`${selectedCount} items selected`}</span>
      {:else}
        <ReadIcon size={56} strokeWidth={1} />
        <span class="placeholder-title">{$t`Select an item to read`}</span>
        <span class="placeholder-hint">{$t`Nothing is selected`}</span>
      {/if}
    </vbox>
  {/if}
</vbox>

<script lang="ts">
  import type { EMail } from "../../../logic/Mail/EMail";
  import { DisplayMode } from "../../../frontend/Mail/Message/MessageBody.svelte";
  import { MailView } from "../MailView";
  import ReadingPaneHeader from "./ReadingPaneHeader.svelte";
  import InfoBars from "./InfoBars.svelte";
  import AttachmentsUI from "../../../frontend/Mail/Message/AttachmentsUI.svelte";
  import SMLDisplayKinds from "../../../frontend/Mail/SML/SMLDisplayKinds.svelte";
  import InvitationBar from "../../Calendar/EditEvent/InvitationBar.svelte";
  import { MailInvitation } from "../../Calendar/EditEvent/MailInvitation";
  import MessageBody from "../../../frontend/Mail/Message/MessageBody.svelte";
  import ReadIcon from "lucide-svelte/icons/mail-open";
  import MultipleIcon from "lucide-svelte/icons/mails";
  import { catchErrors, backgroundError } from "../../../frontend/Util/error";
  import { onDestroy } from "svelte";
  import { t } from "../../../l10n/l10n";

  export let message: EMail | null;
  export let selectedCount = 0;

  const readDelaySetting = MailView.readAfter;
  $: readDelay = $readDelaySetting.value;
  let shownMessage: EMail | null = null;
  $: if (message != shownMessage) {
    shownMessage = message;
    catchErrors(onMessageChanged);
  }
  $: catchErrors(() => markMessageAsRead(shownMessage, readDelay), backgroundError);
  // <copied from="../../../frontend/Mail/Message/MessageHeader.svelte">
  let readTimeout: NodeJS.Timeout;
  function markMessageAsRead(message: EMail, readDelay: number) {
    clearTimeout(readTimeout);
    if (!message || message.isRead) {
      return;
    }
    if (readDelay < 0) {
      return;
    }
    if (readDelay == 0) {
      readDelay = 0.2; // Avoid that normal scrolling marks all msgs as read
    }
    readTimeout = setTimeout(() => {
      message.markRead(true)
        .catch(message.folder.account.errorCallback);
    }, readDelay * 1000);
  }
  onDestroy(() => {
    clearTimeout(readTimeout);
  });
  // </copied>

  // <copied from="../../../frontend/Mail/Message/DisplayModeSwitcher.svelte">
  function onMessageChanged() {
    if (shownMessage && MailView.contentRendering.value == DisplayMode.HTMLWithExternal) {
      MailView.contentRendering.value = DisplayMode.HTML;
    }
  }
  // </copied>
</script>

<style>
  .reading-pane {
    min-width: 0;
    min-height: 0;
    overflow: hidden;
  }
  .message {
    min-height: 0;
  }
  .attachments {
    flex-shrink: 0;
    padding: 0 12px;
  }
  .attachments :global(.attachments) {
    min-height: 0;
  }
  .attachments :global(.attachments-list .attachment) {
    border: 1px solid var(--lo-border);
    border-radius: var(--lo-radius-small);
    background-color: var(--lo-pane-bg);
  }
  .attachments :global(.attachments-list .attachment:hover) {
    background-color: var(--lo-hover-bg);
  }
  .attachments :global(.attachments-list .attachment .icon),
  .attachments :global(.attachments-list .attachment:hover .icon) {
    padding-inline-start: 6px;
    background-color: transparent;
    color: var(--lo-fg-secondary);
  }
  .attachments :global(.attachments-list .attachment .info) {
    width: 200px;
    background-color: transparent;
    color: var(--lo-fg);
    box-shadow: none;
  }
  .attachments :global(.attachments-list .attachment .size) {
    color: var(--lo-fg-secondary);
  }
  .sml {
    flex-shrink: 0;
    padding: 0 20px;
  }
  .body {
    min-height: 120px;
    padding: 4px 8px 8px 20px;
  }
  .body :global(.message-body) {
    min-height: 0;
  }
  .placeholder {
    align-items: center;
    justify-content: center;
    gap: 8px;
    color: var(--lo-fg-secondary);
  }
  .placeholder :global(svg) {
    color: var(--lo-fg-disabled);
  }
  .placeholder-title {
    color: var(--lo-fg);
    font-size: 16px;
    font-weight: 600;
  }
</style>
