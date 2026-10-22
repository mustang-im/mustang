<vbox class="availability-poll" flex>
  <hbox class="option">
    <Checkbox
      label={$t`Only ask people with unknown availability`}
      checked={$onlyUnknownSetting.value}
      allowIndetermined={false}
      on:change={ev => onlyUnknownSetting.value = ev.detail}
      />
  </hbox>
  <hbox class="recipients">
    <hbox class="label">{$t`To *=> email to a person`}</hbox>
    <AvailabilityLoader {event} from={weekStart} to={weekEnd} bind:freeBusy>
      <hbox class="names" class:none={$recipients.isEmpty}>
        {$recipients.hasItems
          ? $recipients.contents.map(participant => participant.name || participant.emailAddress).join(", ")
          : $t`The availability of all participants is known`}
      </hbox>
    </AvailabilityLoader>
  </hbox>
  {#if sml}
    <slot name="editor" {sml}>
      <hbox class="editor" flex>
        <vbox class="poll-calendar" flex>
          <EditCalendar {options} duration={$event.durationMinutes}
            dateStart={new Date(event.startTime)} focusHour={Math.max(event.startTime.getHours() - 1, 0)} />
        </vbox>
        <vbox class="list">
          <hbox class="label">{$t`Possible times`}</hbox>
          {#if $options.isEmpty}
            <hbox class="empty">{$t`Add the times that you propose`}</hbox>
          {/if}
          <EditList {options} duration={$event.durationMinutes} showEndTime={false} />
        </vbox>
      </hbox>
    </slot>
    <hbox class="buttons">
      <Button
        label={$t`Send poll`}
        icon={SendIcon}
        classes="send"
        onClick={onSend}
        disabled={$recipients.isEmpty ? $t`The availability of all participants is known` : false}
        />
    </hbox>
  {:else}
    <hbox class="error">{$t`No suitable email identity to organise this meeting`}</hbox>
  {/if}
</vbox>

<script lang="ts">
  import type { Event } from "../../../../logic/Calendar/Event";
  import type { Participant } from "../../../../logic/Calendar/Participant";
  import { InvitationResponse } from "../../../../logic/Calendar/Invitation/InvitationStatus";
  import type { FreeBusy } from "../../../../logic/Calendar/FreeBusy";
  import type { SMLData } from "../../../../logic/Mail/SML/SMLData";
  import type { TSMLMeetingTimePoll } from "../../../../logic/Mail/SML/TSML";
  import { createMeetingTimePoll } from "../../../../logic/Mail/SML/SMLCreateKind";
  import AvailabilityLoader from "./AvailabilityLoader.svelte";
  import EditCalendar from "../../SML/Shared/EditCalendar.svelte";
  import EditList from "../../SML/Shared/EditList.svelte";
  import Checkbox from "../../../Shared/Checkbox.svelte";
  import Button from "../../../Shared/Button.svelte";
  import SendIcon from "lucide-svelte/icons/send";
  import { openComposer } from "../../../Mail/open";
  import { getLocalStorage } from "../../../Util/LocalStorage";
  import { getWeekStart } from "../../../../logic/util/date";
  import { syncArrayColl } from "../../../../logic/util/collections";
  import { UserError } from "../../../../logic/util/util";
  import type { Collection } from "svelte-collections";
  import { t } from "../../../../l10n/l10n";

  /** The meeting for which to find a time */
  export let event: Event;
  /** The poll, kept while the user switches to other views
   * in/out */
  export let sml: SMLData | null = null;

  const onlyUnknownSetting = getLocalStorage("calendar.availability.pollOnlyUnknown", true);

  const weekStart = getWeekStart(event.startTime);
  const weekEnd = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 7);

  let identity = event.calendar?.inviteAs;
  if (!sml && identity) {
    sml = createMeetingTimePoll(identity);
    let timePoll = sml.sml as TSMLMeetingTimePoll;
    timePoll.duration = event.durationMinutes;
    timePoll.options.push(new Date(event.startTime));
  }
  $: options = sml ? syncArrayColl((sml.sml as TSMLMeetingTimePoll).options, date => date) : null;

  let freeBusy: FreeBusy | null = null;
  $: participants = event.participants;
  $: recipients = pollRecipients($participants, freeBusy, $onlyUnknownSetting.value);
  function pollRecipients(participants: Collection<Participant>, freeBusy: FreeBusy | null, onlyUnknown: boolean): Collection<Participant> {
    return participants.filterOnce(participant =>
      participant.response != InvitationResponse.Organizer &&
      (!onlyUnknown || !freeBusy?.rowFor(participant)?.busy));
  }

  function onSend() {
    if (!(sml.sml as TSMLMeetingTimePoll).options.length) {
      throw new UserError($t`Add the times that you propose`);
    }
    openComposer(event.outgoingInvitation.meetingTimePollMail(recipients, sml));
  }
</script>

<style>
  .availability-poll {
    min-height: 0;
    overflow-y: auto;
    container-type: inline-size;
    container-name: availability-poll;
  }
  .option,
  .recipients {
    align-items: center;
    margin-block-end: 6px;
  }
  .recipients .label {
    margin-inline-end: 12px;
    opacity: 70%;
  }
  .names.none {
    opacity: 70%;
  }
  .recipients :global(.checking) {
    margin: 0;
  }
  .editor {
    flex: 1 0 auto;
    min-height: 250px;
  }
  .poll-calendar {
    min-width: 0;
  }
  .poll-calendar :global(.calendar) {
    flex: 1 1 0;
    height: auto;
    min-height: 0;
  }
  .list {
    width: 200px;
    margin-inline-start: 16px;
    overflow-y: auto;
  }
  .list .label {
    margin-block-end: 8px;
    opacity: 70%;
  }
  .empty {
    opacity: 50%;
  }
  @container availability-poll (max-width: 600px) {
    .editor {
      flex-direction: column;
    }
    .poll-calendar {
      min-height: 250px;
    }
    .poll-calendar :global(.day-header .weekday) {
      display: none;
    }
    .list {
      width: auto;
      margin-inline-start: 0;
      margin-block-start: 8px;
    }
  }
  .buttons {
    justify-content: end;
    margin-block-start: 8px;
  }
  .error {
    margin: 12px;
  }
</style>
