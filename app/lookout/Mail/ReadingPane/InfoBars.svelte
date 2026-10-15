{#if isDraft}
  <hbox class="info-bar">
    <DraftIcon size={16} />
    <span>{$t`This message hasn't been sent.`}</span>
    <button class="link" on:click={() => catchErrors(() => MessageActions.openDraft(message))}>{$t`Edit`}</button>
  </hbox>
{/if}
{#if isJunk}
  <hbox class="info-bar warning">
    <JunkIcon size={16} />
    <span>{$t`This message was marked as junk. Be careful with links and attachments in it.`}</span>
    <button class="link" on:click={() => catchErrors(() => MessageActions.junk([message], false))}>{$t`It's not junk`}</button>
  </hbox>
{/if}
{#if $message.isImportant}
  <hbox class="info-bar">
    <ImportantIcon size={16} class="important" />
    <span>{$t`This message was sent with High importance.`}</span>
  </hbox>
{/if}
{#if $message.isForwarded}
  <hbox class="info-bar">
    <ForwardedIcon size={16} />
    <span>{$t`You forwarded this message.`}</span>
  </hbox>
{:else if $message.isReplied}
  <hbox class="info-bar">
    <RepliedIcon size={16} />
    <span>{$t`You replied to this message.`}</span>
  </hbox>
{/if}
{#if $contentRendering.value == DisplayMode.Plaintext || $contentRendering.value == DisplayMode.Source}
  <hbox class="info-bar">
    <PlainTextIcon size={16} />
    <span>{$contentRendering.value == DisplayMode.Source
      ? $t`You're viewing the source of this message.`
      : $t`This message is shown as plain text.`}</span>
    <button class="link" on:click={() => MailView.contentRendering.value = DisplayMode.HTML}>{$t`Display as HTML`}</button>
  </hbox>
{/if}
{#if $message.loadedBody && $contentRendering.value == DisplayMode.HTML && ExternalContent.hasExternalContent($message.rawHTMLDangerous)}
  <hbox class="info-bar">
    <PicturesIcon size={16} />
    <span>{$t`To help protect your privacy, pictures and other content from the Internet are not downloaded automatically.`}</span>
    <button class="link" on:click={onDownloadPictures}>{$t`Download pictures`}</button>
  </hbox>
{/if}

<script lang="ts">
  import type { EMail } from "../../../logic/Mail/EMail";
  import { DisplayMode } from "../../../frontend/Mail/Message/MessageBody.svelte";
  import { MessageActions } from "../MessageActions";
  import { MailView } from "../MailView";
  import { ExternalContent } from "./ExternalContent";
  import DraftIcon from "lucide-svelte/icons/square-pen";
  import JunkIcon from "lucide-svelte/icons/shield-alert";
  import ImportantIcon from "lucide-svelte/icons/circle-alert";
  import RepliedIcon from "lucide-svelte/icons/reply";
  import ForwardedIcon from "lucide-svelte/icons/forward";
  import PicturesIcon from "lucide-svelte/icons/image-off";
  import PlainTextIcon from "lucide-svelte/icons/file-text";
  import { catchErrors } from "../../../frontend/Util/error";
  import { t } from "../../../l10n/l10n";

  export let message: EMail;

  const contentRendering = MailView.contentRendering;
  $: isDraft = $message && MessageActions.isDraft(message);
  $: isJunk = $message && MessageActions.isJunk([message]);

  function onDownloadPictures() {
    MailView.contentRendering.value = DisplayMode.HTMLWithExternal;
  }
</script>

<style>
  .info-bar {
    align-items: center;
    flex-shrink: 0;
    gap: 8px;
    margin: 0 20px 6px 20px;
    padding: 6px 12px;
    border-radius: var(--lo-radius-small);
    background-color: var(--lo-pane-alt-bg);
    border: 1px solid var(--lo-divider);
    color: var(--lo-fg);
    font-size: 13px;
  }
  .info-bar :global(svg) {
    flex-shrink: 0;
    color: var(--lo-fg-secondary);
  }
  .info-bar :global(svg.important) {
    color: var(--lo-danger);
  }
  .info-bar.warning :global(svg) {
    color: var(--lo-warning);
  }
  .link {
    flex-shrink: 0;
    padding: 0;
    border: none;
    background: none;
    color: var(--lo-accent-text);
    font: inherit;
    cursor: pointer;
  }
  .link:hover {
    text-decoration: underline;
  }
</style>
