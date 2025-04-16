<hbox flex
  class="message"
  class:incoming={!$message.outgoing}
  class:outgoing={$message.outgoing}
  class:followup
  deliveryStatus={$message instanceof ChatMessage ? $message.deliveryStatus : DeliveryStatus.Unknown}
  >
  {#if !$message.outgoing && !followup}
    <vbox class="avatar">
      {#if $message.contact instanceof Person}
        <PersonPicture person={$message.contact} size={32} />
      {/if}
    </vbox>
  {/if}
  <vbox class="right">
    {#if !(fastFollowup && hideHeaderFollowup)}
      <hbox class="meta">
        {#if !$message.outgoing && !followup}
          <hbox class="from">{$message.contact?.name}</hbox>
        {/if}
        <hbox flex>
          <slot name="above-center" />
        </hbox>
        <hbox class="time">{getDateString($message.sent)}</hbox>
      </hbox>
    {/if}
    <vbox class="bubble">
      {#if $$slots.menu}
        <hbox class="menu" class:openMenuOnMessageHover>
          <slot name="menu" />
        </hbox>
      {/if}
      <slot name="inner-top" />
      <div class="text selectable font-normal">
        {@html $message.html || ""}
        <!-- TODO Security: Jail HTML into untrusted <iframe> for additional protection.
        <WebView title={$t`Text`} html={$message.html || ""} {headHTML} autoSize />
        -->
        <slot name="bubble" />
      </div>
      <slot name="inner-bottom" />
    </vbox>
    {#if $reactions.length > 0}
      <hbox class="reactions">
        {#each $reactions.entries().each as [sender, emoji]}
          <hbox class="reaction" title={emoji + " " + sender?.name}>{emoji}</hbox>
        {/each}
      </hbox>
    {/if}
  </vbox>
</hbox>

<script lang="ts">
  import type { Message } from "../../../logic/Abstract/Message";
  import { ChatMessage, DeliveryStatus } from "../../../logic/Chat/Message";
  import { Person } from "../../../logic/Abstract/Person";
  import cssContent from "../../Mail/Message/content.css?inline";
  import cssBody from "../../Mail/Message/content-body.css?inline";
  import cssFont from "../../asset/font/Karla.css?inline";
  import PersonPicture from "../../Contacts/Person/PersonPicture.svelte";
  import WebView from "../../Shared/WebView.svelte";
  import { getDateString } from "../../Util/date";
  import { t } from "../../../l10n/l10n";

  export let message: Message;
  export let previousMessage: Message = null;
  export let hideHeaderFollowup = false;
  export let openMenuOnMessageHover = false;

  $: followup = $message.contact == previousMessage?.contact && // same author
    $message.outgoing == previousMessage?.outgoing;
  $: fastFollowup = followup &&
    $message.sent.getTime() - previousMessage.sent.getTime() < 5 * 60 * 1000; // < 5 mins apart
  $: reactions = $message.reactions;

  $: headHTML = `<style>\n${cssBody}\n${cssContent}\n</style>`;
</script>

<style>
  .message {
    margin: 16px 32px 0 20px;
    color: black;
    max-width: 75%;
  }
  .incoming {
    align-self: flex-start;
  }
  .outgoing {
    align-self: flex-end;
  }
  /** Speech bubble */
  .message .bubble {
    position: relative; /* arrows are relative to this */
    border-bottom-right-radius: 12px;
    border-bottom-left-radius: 12px;
    padding: 7px 15px;
  }
  .incoming .bubble {
    background-color: var(--chat-bubble-incoming-bg);
    color: var(--chat-bubble-incoming-fg);
    border-top-right-radius: 12px;
    box-shadow: 1px 1px 2px 0px rgba(0, 0, 0, 7%);
  }
  .outgoing .bubble {
    background-color: var(--chat-bubble-outgoing-bg);
    color: var(--chat-bubble-outgoing-fg);
    border-top-left-radius: 12px;
    box-shadow: 1px 1px 2px 0px rgba(0, 0, 0, 15%);
  }
  .message.followup {
    margin-block-start: 3px;
  }

  /** Speech bubble arrow */
  .message:not(.followup) .bubble::before {
    content: '';
    position: absolute; /* relative to .bubble position: relative */
    border-style: solid;
  }
  .incoming .bubble::before {
    top: 0;
    left: -10px;
    border-width: 10px 0 0 10px;
    border-color: var(--chat-bubble-incoming-bg) transparent transparent transparent;
  }
  .outgoing .bubble::before {
    top: 0;
    left: 100%;
    border-width: 10px 10px 0 0;
    border-color: var(--chat-bubble-outgoing-bg) transparent transparent transparent;
  }
  .incoming.followup .bubble {
    border-top-left-radius: 12px;
  }
  .outgoing.followup .bubble {
    border-top-right-radius: 12px;
  }

  .avatar {
    margin-block-start: 3px;
    margin-inline-end: 4px;
  }
  .message.followup.incoming {
    /* no avatar */
    padding-inline-start: 60px;
  }
  .meta {
    align-items: end;
    margin-block-end: 2px;
    font-size: x-small;
    color: #999999;
  }
  .incoming .meta {
    margin-inline-start: 10px;
  }
  .outgoing .meta {
    justify-content: end;
    margin-inline-end: 10px;
  }
  .from {
    margin-inline-end: 16px;
  }
  .text {
    overflow-wrap: anywhere;
  }
  .text > :global(p) {
    margin: 0;
  }

  .text :global(blockquote) {
    border-left: 3px solid grey;
    padding-inline-start: 16px;
    margin-inline-start: 0px;
  }
  .text :global(pre) {
    white-space: pre-wrap !important;
  }
  .text :global(*) {
    text-wrap: wrap !important;
    overflow-wrap: anywhere !important;
  }

  .reactions {
    z-index: 1;
    align-self: flex-end;
    margin-block-start: -6px;
    margin-inline-end: 16px;
    padding: 0px 4px;
    border: 2px solid transparent;
    border-radius: 20px;
    background-color: white;
    box-shadow: 1px 1px 2px 0px rgba(0, 0, 0, 10%);
  }
  .outgoing .reactions {
    background-color: white;
  }

  .menu {
    display: none;
  }
  .message:hover .menu.openMenuOnMessageHover,
  .menu:hover,
  .message:has(.meta:hover) .menu {
    display: flex;
    position: absolute;
    height: 24px;
    max-height: 24px;
    top: -30px;
    right: 10%;
    align-items: center;
    justify-content: end;
    overflow: hidden;
    text-overflow: ellipsis;
    background-color: var(--leftbar-bg);
    color: var(--leftbar-fg);
    padding: 0px 4px;
    border: 2px solid transparent;
    border-radius: 20px;
    box-shadow: 1px 1px 2px 0px rgba(0, 0, 0, 10%);
    z-index: 1;
  }
  .menu > * {
    margin-inline-start: 8px;
  }
  .menu :global(svg) {
    stroke-width: 1.5px;
  }

  .outgoing[deliveryStatus=sending] {
    opacity: 70%;
  }
</style>
