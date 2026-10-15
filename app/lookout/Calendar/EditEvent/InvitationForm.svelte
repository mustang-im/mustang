<vbox flex class="invitation-form">
  <InfoBar {messages} />
  <grid class="fields">
    {#if organizer}
      <span class="row-label">{$t`Organizer`}</span>
      <hbox class="value organizer">
        <span class="name">{organizer.name || organizer.emailAddress}</span>
        {#if organizer.name && organizer.emailAddress}
          <span class="lo-secondary">{organizer.emailAddress}</span>
        {/if}
      </hbox>
    {/if}
    <span class="row-label">{$t`Required`}</span>
    <hbox class="value attendees">
      <AttendeesField {event} readOnly />
    </hbox>
    <span class="row-label">{$t`When`}</span>
    <span class="value">{when}</span>
    {#if $event.location}
      <span class="row-label">{$t`Location`}</span>
      <span class="value">{$event.location}</span>
    {/if}
    {#if $event.isOnline && $event.onlineMeetingURL}
      <span class="row-label">{$t`Online meeting`}</span>
      <hbox class="value online">
        <button class="join" on:click={() => catchErrors(() => flow.joinOnlineMeeting())}>
          <JoinIcon size={16} /> {$t`Join`}
        </button>
        <span class="url lo-secondary">{$event.onlineMeetingURL}</span>
      </hbox>
    {/if}
  </grid>
  {#if $attachments.hasItems}
    <vbox class="attachments">
      <Attachments {attachments} />
    </vbox>
  {/if}
  <vbox flex class="body">
    {#if $event.hasDescription}
      <WebView html={$event.descriptionHTML} title="" {headHTML} />
    {/if}
  </vbox>
</vbox>

<script lang="ts">
  import type { Event } from "../../../logic/Calendar/Event";
  import type { EventEditFlow } from "./EventEditFlow";
  import { EventFormInfo, type InfoMessage } from "./EventFormInfo";
  import InfoBar from "./InfoBar.svelte";
  import AttendeesField from "./AttendeesField.svelte";
  import Attachments from "../../../frontend/Mail/Message/AttachmentsUI.svelte";
  import WebView from "../../../frontend/Shared/WebView.svelte";
  import cssContent from "../../../frontend/Mail/Message/content.css?inline";
  import cssBody from "../../../frontend/Mail/Message/content-body.css?inline";
  import { catchErrors } from "../../../frontend/Util/error";
  import JoinIcon from "lucide-svelte/icons/video";
  import { getDateTimeLocale, t } from "../../../l10n/l10n";

  export let event: Event;
  export let flow: EventEditFlow;
  export let messages: InfoMessage[];

  $: organizer = $event.organizer;
  $: when = EventFormInfo.whenText($event, getDateTimeLocale());
  $: attachments = event.attachments;

  // <copied from="../../../frontend/Calendar/Invitation/InvitationInCalendar.svelte">
  let headHTML = `<style>\n${cssBody}\n${cssContent}\n</style>`;
  // </copied>
</script>

<style>
  .invitation-form {
    min-height: 0;
  }
  .fields {
    flex-shrink: 0;
    grid-template-columns: max-content 1fr;
    align-items: center;
    column-gap: 16px;
    row-gap: 10px;
    padding: 8px 24px 16px 24px;
    border-block-end: 1px solid var(--lo-divider);
  }
  .row-label {
    min-width: 80px;
    color: var(--lo-fg-secondary);
    text-align: end;
  }
  .value {
    min-width: 0;
    align-items: center;
    gap: 8px;
    overflow-wrap: anywhere;
  }
  .organizer .name {
    font-weight: 600;
  }
  .attendees :global(.persons-autocomplete) {
    border-block-end: none;
    padding: 0;
  }
  .join {
    display: flex;
    align-items: center;
    gap: 6px;
    height: 30px;
    padding: 0 12px;
    border: none;
    border-radius: var(--lo-radius-small);
    background-color: var(--lo-accent);
    color: var(--lo-accent-fg);
    font: inherit;
    cursor: pointer;
  }
  .join:hover {
    background-color: var(--lo-accent-hover);
  }
  .url {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .attachments {
    flex-shrink: 0;
    padding: 8px 24px;
    border-block-end: 1px solid var(--lo-divider);
  }
  .body {
    min-height: 0;
    padding: 8px 16px;
  }
</style>
