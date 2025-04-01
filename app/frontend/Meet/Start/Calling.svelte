<vbox flex class="calling" state={$meeting.state}>
  <hbox flex />
  <hbox class="boxes" flex>
    <hbox flex />
    <vbox class="box">
      <vbox class="text">
        <hbox class="what">
          {#if $meeting.state == MeetingState.OutgoingCallPrepare}
            {$t`Do you want to call?`}
          {:else if $meeting.state == MeetingState.OutgoingCall}
            {$t`You're calling...`}
          {:else if $meeting.state == MeetingState.IncomingCall}
          {/if}
        </hbox>
        <hbox class="who">
          {#if $participants.length == 1}
            {participants.first.name}
          {:else if $participants.length > 1}
            {meeting.event?.title}
          {/if}
        </hbox>
        <hbox class="who-count">
          {#if $participants.length > 1}
            ({participants.length} participants)
          {/if}
        </hbox>
        <hbox class="what">
          {#if $meeting.state == MeetingState.OutgoingCallPrepare}
          {:else if $meeting.state == MeetingState.OutgoingCall}
          {:else if $meeting.state == MeetingState.IncomingCall}
            {$t`is calling you...`}
          {/if}
        </hbox>
      </vbox>
      <vbox class="participants" flex>
        {#if $participants.length == 1}
          <PersonPicture person={participants.first} size={196} />
        {:else if $participants.length > 1}
          <GroupPicture persons={participants} size={196} />
        {/if}
      </vbox>
      <hbox class="actions">
        {#if $meeting.state == MeetingState.Init || $meeting.state == MeetingState.OutgoingCallPrepare}
          <RoundButton classes="cancel"
            label={$t`Cancel`}
            icon={XIcon}
            iconSize="24px"
            onClick={cancel}
            />
        {:else}
          <RoundButton classes="hangup"
            label={$meeting.state == MeetingState.IncomingCall ? $t`Decline call` : $t`Hang up`}
            icon={HangUpIcon}
            onClick={hangup}
            iconSize="24px"
            border={false} />
        {/if}
        <hbox flex />
        {#if $meeting.state != MeetingState.OutgoingCall}
          <RoundButton classes="accept"
            label={$meeting.state == MeetingState.Init ? $t`Start conference` : $meeting.state == MeetingState.OutgoingCallPrepare ? $t`Call` : $t`Accept call`}
            icon={$meeting.state == MeetingState.Init ? OpenIcon : CallIcon}
            iconSize="24px"
            onClick={accept}
            border={false} />
        {/if}
      </hbox>
    </vbox>
    <hbox class="gap" />
    <vbox class="device-setup">
      <DeviceSetup />
    </vbox>
    <hbox flex />
  </hbox>
  <hbox class="bottom-bar" flex>
    <vbox class="info" flex>
      {#if upcomingMeeting}
        <vbox class="upcoming-meeting">
          <hbox class="when">
            <HourglassIcon size="16px" />
            {$t`You have a meeting in ${upcomingMeetingInMin} minutes:`}
          </hbox>
          <hbox class="title">
            {upcomingMeeting.title}
          </hbox>
        </vbox>
      {/if}
    </vbox>
  </hbox>
</vbox>
{#if $meeting.state == MeetingState.IncomingCall || $meeting.state == MeetingState.OutgoingCall }
  <audio src="/sound/ringtone1.mp3" loop autoplay />
{/if}


<script lang="ts">
  import { MeetingState, type VideoConfMeeting } from "../../../logic/Meet/VideoConfMeeting";
  import { appGlobal } from "../../../logic/app";
  import RoundButton from "../../Shared/RoundButton.svelte";
  import PersonPicture from "../../Contacts/Person/PersonPicture.svelte";
  import GroupPicture from "../../Contacts/Person/GroupPicture.svelte";
  import DeviceSetup from "../Setup/DeviceSetup.svelte";
  import CallIcon from "lucide-svelte/icons/phone-call";
  import HangUpIcon from "lucide-svelte/icons/phone";
  import XIcon from "lucide-svelte/icons/x";
  import OpenIcon from "lucide-svelte/icons/door-open";
  import HourglassIcon from "lucide-svelte/icons/hourglass";
  import { mergeColls } from "svelte-collections";
  import { t } from "../../../l10n/l10n";

  export let meeting: VideoConfMeeting;

  $: participants = meeting.participants;

  const allEvents = mergeColls(appGlobal.calendars.map(calendar => calendar.events));
  const now = new Date();
  const maxUpcoming = new Date(); // TODO now + 15 min
  maxUpcoming.setMinutes(maxUpcoming.getMinutes() + 15);
  const upcomingMeetings = allEvents.filter(event => event.startTime > now && event.startTime < maxUpcoming);
  $: upcomingMeeting = $upcomingMeetings.first;
  $: upcomingMeetingInMin = upcomingMeeting?.startTime ? Math.floor((upcomingMeeting.startTime.getTime() - new Date().getTime()) / 1000 / 60) : 0;

  async function cancel() {
    meeting.state = MeetingState.Ended;
    appGlobal.meetings.remove(meeting);
  }

  async function accept() {
    if (meeting.state == MeetingState.IncomingCall) {
      await meeting.answer();
    } else if (meeting.state == MeetingState.OutgoingCallPrepare) {
      await meeting.call();
    } else if (meeting.state == MeetingState.Init || meeting.state == MeetingState.JoinConference) {
      await meeting.start();
    } else {
      throw new Error("Unknown state. Cannot start the call.");
    }
  }

  async function hangup() {
    await meeting.hangup();
  }
</script>

<style>
  .calling {
    background-color: #494558;
  }
  @media (max-width: 800px) {
    .boxes {
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
  }
  .box,
  .device-setup {
    aspect-ratio: 8/10;
    border-radius: 4px;
    background-color: var(--inverted-bg);
    color: var(--inverted-fg);
  }
  .box {
    max-width: 400px;
    max-height: 400px;
    padding: 40px;
  }
  .device-setup {
    max-width: 400px;
    max-height: 440px;
    padding: 20px 0px;
  }
  .text {
    align-items: center;
    justify-content: center;
    margin-block-end: 20px;
  }
  .text .who {
    font-size: 24px;
    font-weight: bold;
  }
  .participants {
    align-items: center;
    justify-content: center;
  }
  .actions {
    margin-block-start: 12px;
  }
  .actions :global(button) {
    padding: 16px;
  }
  .actions :global(button.accept svg),
  .actions :global(button.hangup svg) {
    stroke: white;
  }
  .actions :global(.call-person .avatar) {
    margin: -4px 0px;
  }
  .actions :global(button.accept) {
    background-color: #20AF9E;
  }
  .actions :global(button.hangup) {
    transform: rotate(135deg);
    background-color: #F34949 !important;
  }

  .gap {
    min-width: 10%;
    min-height: 10%;
  }
  .device-setup :global(button.button),
  .device-setup :global(button.button:hover:not(.disabled)) {
    border: 2px solid var(--inverted-bg) !important;
  }
  .device-setup :global(button.border svg path) {
    stroke-width: 1.5px;
  }
  .device-setup :global(button.button) {
    background-color: #CBCACA;
  }

  .bottom-bar {
    justify-content: end;
    align-items: end;
    width: 100%;
  }
  .info {
    justify-content: center;
    align-items: center;
    height: 100%;
  }
  .upcoming-meeting .when {
    justify-content: center;
    align-items: center;
  }
  .upcoming-meeting .title {
    justify-content: center;
    align-items: center;
  }

  .calling[state="incoming"] .what,
  .calling[state="outgoing"] .what,
  .actions :global(button.hangup:hover),
  .actions :global(button.accept:hover) {
    animation-name: color;
      animation-duration: 0.5s;
      animation-iteration-count: infinite;
      animation-direction: alternate;
      animation-timing-function: ease;
  }
  @keyframes color {
    to {
      opacity: 70%;
    }
  }
  .calling[state="incoming"] .participants,
  .calling[state="outgoing"] .participants {
    animation-name: shake;
      animation-delay: 0.3s;
      animation-duration: 2s;
      animation-iteration-count: infinite;
      animation-direction: alternate;
      animation-timing-function: ease;
  }
  @keyframes shake {
    from {
      margin-inline-start: 3px;
    }
    2% {
      margin-inline-start: -3px;
    }
    4% {
      margin-inline-start: 3px;
    }
    6% {
      margin-inline-start: -3px;
    }
    8% {
      margin-inline-start: 3px;
    }
    10% {
      margin-inline-start: -3px;
    }
    12% {
      margin-inline-start: 3px;
    }
    14% {
      margin-inline-start: 0px;
    }
  }
</style>
