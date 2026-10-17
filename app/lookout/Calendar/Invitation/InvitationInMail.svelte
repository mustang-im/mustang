<vbox class="invitation-bar">
  {#if !$message.event}
    {#await loadEvent()}
      <hbox class="info-bar">
        <InfoIcon size={16} />
        <span>{$t`Loading the meeting…`}</span>
      </hbox>
    {:then}
      {#if !$message.event}
        <hbox class="info-bar">
          <InfoIcon size={16} />
          <span>{$t`The meeting of this invitation was not found.`}</span>
        </hbox>
      {/if}
    {:catch ex}
      <hbox class="info-bar warning">
        <WarningIcon size={16} />
        <span>{ex?.message ?? ex}</span>
      </hbox>
    {/await}
  {:else}
    <hbox class="info-bar" class:cancelled={isCancelled}>
      {#if isCancelled}
        <CancelledIcon size={16} />
      {:else}
        <InfoIcon size={16} />
      {/if}
      <span>{statusText}</span>
    </hbox>
    {#if conflict == "conflict"}
      <hbox class="info-bar warning">
        <WarningIcon size={16} />
        <span>{$t`This appointment conflicts with another one on your calendar.`}</span>
      </hbox>
    {:else if conflict == "adjacent"}
      <hbox class="info-bar">
        <InfoIcon size={16} />
        <span>{$t`Adjacent to another appointment on your calendar.`}</span>
      </hbox>
    {/if}
    {#if isCancelled && hasCalEvent}
      <hbox class="respond">
        <ResponseButton label={$t`Remove from Calendar`} icon={RemoveIcon}
          onClick={onRemove} />
      </hbox>
    {:else if canRespond}
      <hbox class="respond" role="group" aria-label={$t`Respond`}>
        <ResponseButton label={$t`Accept`} icon={AcceptIcon} classes="accept"
          pressed={response == InvitationResponse.Accept}
          onClick={() => onRespond(InvitationResponse.Accept)} />
        <ResponseButton label={$t`Tentative`} icon={TentativeIcon} classes="tentative"
          pressed={response == InvitationResponse.Tentative}
          onClick={() => onRespond(InvitationResponse.Tentative)} />
        <ResponseButton label={$t`Decline`} icon={DeclineIcon} classes="decline"
          pressed={response == InvitationResponse.Decline}
          onClick={() => onRespond(InvitationResponse.Decline)} />
      </hbox>
    {/if}
    <grid class="details">
      <ClockIcon size={16} />
      <span class:cancelled={isCancelled}>{when}</span>
      {#if $event.location}
        <LocationIcon size={16} />
        <span>{$event.location}</span>
      {/if}
      {#if $event.isOnline && $event.onlineMeetingURL}
        <OnlineIcon size={16} />
        <hbox>
          <button class="link" on:click={() => catchErrors(onJoin)} title={$event.onlineMeetingURL}>
            {$t`Join the online meeting`}
          </button>
        </hbox>
      {/if}
    </grid>
    {#if kind != "reply"}
      <EventInDayView event={$event} onShowInCalendar={showInCalendar} />
    {/if}
  {/if}
</vbox>

<script lang="ts">
  import type { EMail } from "../../../logic/Mail/EMail";
  import { InvitationResponse, type InvitationResponseInMessage } from "../../../logic/Calendar/Invitation/InvitationStatus";
  import { openExternalURL } from "../../../logic/util/os-integration";
  import { appGlobal } from "../../../logic/app";
  import { MailInvitation } from "../EditEvent/MailInvitation";
  import { CalendarActions } from "../CalendarActions";
  import { calendarMustangApp } from "../../../frontend/Calendar/CalendarMustangApp";
  import { selectedDate, selectedEvent, startDate } from "../../../frontend/Calendar/selected";
  import { openApp } from "../../../frontend/AppsBar/selectedApp";
  import { EventFormInfo } from "../EditEvent/EventFormInfo";
  import EventInDayView from "../DisplayEvent/EventInDayView.svelte";
  import ResponseButton from "./ResponseButton.svelte";
  import { catchErrors } from "../../../frontend/Util/error";
  import InfoIcon from "lucide-svelte/icons/info";
  import WarningIcon from "lucide-svelte/icons/triangle-alert";
  import CancelledIcon from "lucide-svelte/icons/calendar-x-2";
  import RemoveIcon from "lucide-svelte/icons/calendar-minus-2";
  import AcceptIcon from "lucide-svelte/icons/check";
  import TentativeIcon from "lucide-svelte/icons/circle-help";
  import DeclineIcon from "lucide-svelte/icons/x";
  import ClockIcon from "lucide-svelte/icons/clock-3";
  import LocationIcon from "lucide-svelte/icons/map-pin";
  import OnlineIcon from "lucide-svelte/icons/video";
  import { getDateTimeLocale, t } from "../../../l10n/l10n";

  export let message: EMail;

  const calendarEvents = appGlobal.calendarEvents;

  $: calendar = $message && message.event ? MailInvitation.findCalendar(message) : null;
  $: incoming = calendar?.getIncomingInvitationForEMail(message) ?? null;
  $: kind = $message && MailInvitation.kindOf(message);
  $: event = $message && message.event;
  let response: InvitationResponse;
  $: response = incoming?.myParticipation ?? InvitationResponse.NoResponseReceived;
  $: canRespond = kind == "invitation" && !!incoming && response != InvitationResponse.Organizer;
  $: calEvent = $calendarEvents && (incoming?.calEvent() ?? null);
  $: hasCalEvent = !!calEvent;
  $: isCancelled = kind == "cancellation" || !!calEvent?.isCancelled;
  $: statusText = response && MailInvitation.statusText(message, incoming, response, calEvent);
  $: when = $event ? EventFormInfo.whenText($event, getDateTimeLocale()) : "";
  $: conflict = kind == "invitation" && !isCancelled && $event && response != InvitationResponse.Decline
    ? EventFormInfo.conflict(calEvent ?? $event, $calendarEvents.filter(dayEvent => !dayEvent.isSameUID($event)))
    : null;

  // <copied from="../../../frontend/Calendar/Invitation/InvitationInMail.svelte"> Only for old messages that didn't save the event
  async function loadEvent() {
    if (message.invitationMessage) {
      await message.loadEvent();
    }
  }
  // </copied>

  async function onRespond(newResponse: InvitationResponseInMessage) {
    await incoming.respondToInvitationFromMail(newResponse);
    response = newResponse;
  }

  async function onRemove() {
    let eventInCalendar = incoming?.calEvent();
    if (eventInCalendar) {
      await CalendarActions.deleteOccurrence(eventInCalendar);
    }
    incoming = incoming;
  }

  function showInCalendar() {
    let eventInCalendar = incoming?.calEvent() ?? null;
    let day = new Date((eventInCalendar ?? event).startTime);
    $selectedEvent = eventInCalendar;
    $selectedDate = day;
    $startDate = day;
    openApp(calendarMustangApp, {});
  }

  async function onJoin() {
    await openExternalURL($event.onlineMeetingURL);
  }
</script>

<style>
  .invitation-bar {
    flex-shrink: 0;
    gap: 8px;
    margin: 0 20px 8px 20px;
  }
  /* <copied from="../../Mail/Message/InfoBars.svelte"> */
  .info-bar {
    align-items: center;
    flex-shrink: 0;
    gap: 8px;
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
  /* </copied> */
  .info-bar.cancelled :global(svg) {
    color: var(--lo-danger);
  }
  .info-bar.cancelled span {
    font-weight: 600;
  }
  .respond {
    gap: 8px;
  }
  .details {
    grid-template-columns: max-content 1fr;
    align-items: center;
    column-gap: 10px;
    row-gap: 4px;
    padding: 0 2px;
  }
  .details :global(svg) {
    color: var(--lo-fg-secondary);
  }
  .details .cancelled {
    text-decoration: line-through;
  }
</style>
