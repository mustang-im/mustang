<vbox flex class="calling" state={$meeting.state}>
  <hbox flex />
  <hbox flex>
    <hbox flex />
    <vbox class="box">
      <vbox class="text">
        <hbox class="what">
          {#if $meeting.state == MeetingState.OutgoingCallPrepare}
            Do you want to call?
          {:else if $meeting.state == MeetingState.OutgoingCall}
            You're calling...
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
            is calling you...
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
            label="Cancel"
            icon={XIcon}
            iconSize="24px"
            on:click={() => catchErrors(cancel)}
            />
        {:else}
          <RoundButton classes="hangup"
            label={$meeting.state == MeetingState.IncomingCall ? "Decline call" : "Hang up"}
            icon={HangUpIcon}
            on:click={() => catchErrors(hangup)}
            iconSize="24px"
            border={false} />
        {/if}
        <hbox flex />
        {#if $meeting.state != MeetingState.OutgoingCall}
          <RoundButton classes="accept"
            label={$meeting.state == MeetingState.Init ? "Start conference" : $meeting.state == MeetingState.OutgoingCallPrepare ? "Call" : "Accept call"}
            icon={$meeting.state == MeetingState.Init ? OpenIcon : CallIcon}
            iconSize="24px"
            on:click={() => catchErrors(accept)}
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
            You have a meeting in {upcomingMeetingInMin} minutes:
          </hbox>
          <hbox class="title">
            {upcomingMeeting.title}
          </hbox>
        </vbox>
      {/if}
    </vbox>
  </hbox>
</vbox>

<script lang="ts">
  import { MeetingState, type VideoConfMeeting } from "../../../logic/Meet/VideoConfMeeting";
  import { appGlobal } from "../../../logic/app";
  import RoundButton from "../../Shared/RoundButton.svelte";
  import PersonPicture from "../../Shared/Person/PersonPicture.svelte";
  import GroupPicture from "../../Shared/Person/GroupPicture.svelte";
  import DeviceSetup from "../Setup/DeviceSetup.svelte";
  import CallIcon from "lucide-svelte/icons/phone-call";
  import HangUpIcon from "lucide-svelte/icons/phone";
  import XIcon from "lucide-svelte/icons/x";
  import OpenIcon from "lucide-svelte/icons/door-open";
  import HourglassIcon from "lucide-svelte/icons/hourglass";
  import { mergeColls } from "svelte-collections";
  import { catchErrors } from "../../Util/error";

  export let meeting: VideoConfMeeting;

  $: participants = meeting.participants;

  const allEvents = mergeColls(appGlobal.calendars.map(calendar => calendar.events).values());
  const now = new Date();
  const maxUpcoming = new Date(); // TODO now + 15 min
  maxUpcoming.setMinutes(maxUpcoming.getMinutes() + 15);
  const upcomingMeetings = allEvents.filter(event => event.startTime > now && event.startTime < maxUpcoming);
  $: upcomingMeeting = $upcomingMeetings.first;
  $: upcomingMeetingInMin = upcomingMeeting ? Math.floor((upcomingMeeting.startTime.getTime() - new Date().getTime()) / 1000 / 60) : 0;

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
  .box {
    max-width: 400px;
    max-height: 400px;
    aspect-ratio: 8/10;
    background-color: #160C27;
    border-radius: 4px;
    padding: 40px;
  }
  .device-setup {
    max-width: 400px;
    max-height: 440px;
    aspect-ratio: 8/10;
    background-color: #160C27;
    border-radius: 4px;
    padding: 20px 0px;
  }
  .text {
    color: white;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
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
    margin-top: 12px;
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
    width: 10%;
  }
  .device-setup :global(button.button),
  .device-setup :global(button.button:hover:not(.disabled)) {
    border: 2px solid #160C27 !important;
  }
  .device-setup :global(button.border svg path) {
    stroke-width: 1.5px;
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
      animation-duration: 1s;
      animation-iteration-count: infinite;
      animation-direction: alternate;
      animation-timing-function: ease;
  }
  @keyframes shake {
    from {
      margin-left: -2px;
    }
    5% {
      margin-left: 2px;
    }
    10% {
      margin-left: -2px;
    }
    15% {
      margin-left: 2px;
    }
    20% {
      margin-left: 0px;
    }
  }
</style>
