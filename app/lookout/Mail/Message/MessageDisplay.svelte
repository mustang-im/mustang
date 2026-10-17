<vbox flex class="reading-pane lo-card">
  {#if shownMessage}
    {#key shownMessage}
      <vbox flex class="message">
        <MessageHeader message={shownMessage} />
        {#if reply}
          {#key reply}
            <MailComposer mail={reply.draft} isInline autofocus={focusReply} />
          {/key}
        {:else}
          <InfoBars message={shownMessage} />
          <hbox class="attachments">
            <AttachmentsUI attachments={shownMessage.attachments} />
          </hbox>
          {#if MailInvitation.isInvitationMail($shownMessage)}
            <InvitationInMail message={shownMessage} />
          {:else}
            {#if $shownMessage.sml}
              <vbox class="sml">
                <SMLDisplayKinds message={shownMessage} sml={$shownMessage.sml} />
              </vbox>
            {/if}
          {/if}
          <vbox flex class="body">
            <MessageBody message={shownMessage} />
          </vbox>
        {/if}
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
  import { getLocalStorage } from "../../../frontend/Util/LocalStorage";
  import { InlineReplies, type InlineReply } from "../Composer/InlineReplies";
  import MailComposer from "../Composer/MailComposer.svelte";
  import MessageHeader from "./MessageHeader.svelte";
  import InfoBars from "./InfoBars.svelte";
  import AttachmentsUI from "./AttachmentsUI.svelte";
  import SMLDisplayKinds from "../SML/SMLDisplayKinds.svelte";
  import InvitationInMail from "../../Calendar/Invitation/InvitationInMail.svelte";
  import { MailInvitation } from "../../Calendar/EditEvent/MailInvitation";
  import MessageBody from "../../../frontend/Mail/Message/MessageBody.svelte";
  import ReadIcon from "lucide-svelte/icons/mail-open";
  import MultipleIcon from "lucide-svelte/icons/mails";
  import { catchErrors, backgroundError } from "../../../frontend/Util/error";
  import { onDestroy } from "svelte";
  import { t } from "../../../l10n/l10n";

  export let message: EMail | null;
  export let selectedCount = 0;

  const readDelaySetting = getLocalStorage<number>("mail.read.after", 0);
  const contentRendering = getLocalStorage<string>("mail.contentRendering", "html");
  $: readDelay = $readDelaySetting.value;
  let shownMessage: EMail | null = null;
  $: if (message != shownMessage) {
    shownMessage = message;
    catchErrors(onMessageChanged);
  }
  $: catchErrors(() => markMessageAsRead(shownMessage, readDelay), backgroundError);

  const inlineReplies = InlineReplies.replies;
  let reply: InlineReply | null = null;
  let focusReply = false;
  $: $inlineReplies, shownMessage, updateReply();
  function updateReply() {
    let current = InlineReplies.replyFor(shownMessage);
    if (current == reply) {
      return;
    }
    reply = current;
    focusReply = !!reply?.isNew;
    if (reply) {
      reply.isNew = false;
    }
  }
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
    if (shownMessage && contentRendering.value == DisplayMode.HTMLWithExternal) {
      contentRendering.value = DisplayMode.HTML;
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
    padding: 0 20px 8px 20px;
  }
  .sml {
    flex-shrink: 0;
    padding: 0 20px 8px 20px;
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
