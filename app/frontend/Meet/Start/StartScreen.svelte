<hbox flex>
  <vbox flex class="actions-container">
    <vbox class="actions">
      {#if $selectedPerson}
        <Button label={$t`Call ${$selectedPerson.name}`} onClick={callSelected} errorCallback={showError} classes="call-person secondary">
          <PersonPicture slot="icon" person={$selectedPerson} size={24} />
        </Button>
      {/if}
      <Button label={$t`Start an ad-hoc meeting`} icon={VideoIcon} onClick={startAdHocMeeting} errorCallback={showError} classes="secondary" />
      <Button label={$t`Plan a meeting`} icon={AddToCalendarIcon} classes="secondary" iconSize="14px" />
      <hbox>
        <input class="meeting-link" type="url" bind:value={conferenceURL}
          placeholder={$t`Enter meeting link to join`}
          on:input={() => errorMsg = null}
          on:paste={() => catchErrors(joinURLPasted, showError)}
          on:keydown={event => onKeyEnter(event, () => catchErrors(joinByURL, showError))} />
        <Button label={$t`Join`} classes="secondary"
          disabled={!conferenceURL}
          onClick={joinByURL} errorCallback={showError} />
      </hbox>
    </vbox>
    <vbox class="error">
      {#if errorMsg}
        <ErrorMessage bind:errorMessage={errorMsg} errorGravity={ErrorGravity.Error} />
      {/if}
    </vbox>
  </vbox>
  <vbox flex class="meetings">
    <vbox flex class="upcoming">
      <hbox class="title font-small">{$t`Today's next meetings`}</hbox>
      <MeetingList meetings={upcomingMeetings}>
        <div slot="emptyMsg" class="emptyMsg font-small">{$t`No meetings coming up`}</div>
      </MeetingList>
    </vbox>
    <vbox flex class="previous">
      <hbox class="title font-small">{$t`Previous meetings`}</hbox>
      <MeetingList meetings={previousMeetings}>
        <div slot="emptyMsg" class="emptyMsg font-small">{$t`No recent meetings`}</div>
      </MeetingList>
    </vbox>
    <hbox class="test">
      <ExpandSection>
        <vbox class="buttons">
          {#if $selectedPerson}
            <Button label={$t`Test incoming call`} icon={VideoIcon} onClick={testIncoming} errorCallback={showError} classes="secondary" />
          {/if}
          <Button label={$t`Start a fake meeting`} icon={VideoIcon} onClick={startFakeMeeting} errorCallback={showError} classes="secondary" />
        </vbox>
      </ExpandSection>
    </hbox>
  </vbox>
</hbox>

<script lang="ts">
  import { MeetingState, VideoConfMeeting } from "../../../logic/Meet/VideoConfMeeting";
  import { VideoStream } from "../../../logic/Meet/VideoStream";
  import { MeetingParticipant } from "../../../logic/Meet/Participant";
  import { FakeMeeting } from "../../../logic/Meet/FakeMeeting";
  import { Event } from "../../../logic/Calendar/Event";
  import { joinConferenceByURL } from "../../../logic/Meet/StartCall";
  import { selectedPerson } from "../../Contacts/Person/Selected";
  import { appGlobal } from "../../../logic/app";
  import { MeetAccount } from "../../../logic/Meet/MeetAccount";
  import { LocalMediaDeviceStreams } from "../../../logic/Meet/LocalMediaDeviceStreams";
  import MeetingList from "./MeetingList.svelte";
  import Button from "../../Shared/Button.svelte";
  import VideoIcon from 'lucide-svelte/icons/video';
  import AddToCalendarIcon from "lucide-svelte/icons/calendar-plus";
  import PersonPicture from "../../Contacts/Person/PersonPicture.svelte";
  import ErrorMessage, { ErrorGravity } from "../../Shared/ErrorMessage.svelte";
  import { gt, t } from "../../../l10n/l10n";
  import { catchErrors, logError } from "../../Util/error";
  import { onKeyEnter } from "../../Util/util";
  import { sleep, UserError } from "../../../logic/util/util";
  import { mergeColls } from "svelte-collections";
  import { faker } from "@faker-js/faker";
  import ExpandSection from "../../Shared/ExpandSection.svelte";

  const now = new Date();
  const maxUpcoming = new Date(); // TODO now + 8 hours
  const maxPrevious = new Date(); // TODO now - 14 days
  const upcomingMeetings = appGlobal.calendarEvents.filterObservable(event => event.startTime > now && event.startTime < maxUpcoming);
  const previousMeetings = appGlobal.calendarEvents.filterObservable(event => event.startTime < now && event.startTime > maxPrevious);

  function getAccount(): MeetAccount {
    let account = appGlobal.meetAccounts.find(acc => acc.canVideo && acc.canMultipleParticipants);
    if (!account) {
      throw new UserError(gt`Please configure a matching meeting account first`);
    }
    return account;
  }

  async function startAdHocMeeting() {
    let meeting = getAccount().newMeeting();
    await meeting.createNewConference();
    appGlobal.meetings.add(meeting);
  }

  async function startFakeMeeting() {
    let meeting = new FakeMeeting();
    await meeting.createNewConference();
    appGlobal.meetings.add(meeting);
  }

  class FakeIncomingCall extends VideoConfMeeting {
    constructor() {
      super();
      this.account = new MeetAccount();
      this.mediaDeviceStreams = new LocalMediaDeviceStreams();
      this.listenStreamChanges();
      this.state = MeetingState.IncomingCall;
    }
    async answer(): Promise<void> {
      super.answer();
      this.myParticipant = new MeetingParticipant();
      this.state = MeetingState.Ongoing;
    }
  }

  async function testIncoming() {
    let fakeMeeting = new Event();
    fakeMeeting.startTime = faker.date.soon({ days: 1/24/4 });
    fakeMeeting.endTime = faker.date.soon({ days: 1/24 });
    fakeMeeting.title = faker.word.words();
    fakeMeeting.descriptionText = faker.hacker.phrase();
    appGlobal.calendars.first.events.add(fakeMeeting);

    let caller = new MeetingParticipant();
    caller.name = $selectedPerson.name;
    caller.picture = $selectedPerson.picture;
    let meeting = new FakeIncomingCall();
    meeting.participants.add(caller);
    appGlobal.meetings.add(meeting);
  }

  async function callSelected() {
    let callee = new MeetingParticipant();
    callee.name = $selectedPerson.name;
    callee.picture = $selectedPerson.picture;

    let event = new Event();
    event.startTime = faker.date.past({ years: 0.001 });
    event.endTime = faker.date.future({ years: 0.001 });
    event.title = $t`Final Approval UX Meet`;
    event.descriptionHTML = $t`<p>
      Objectives of the meeting are:
      <ol>
        <li>Review of the UX specs for Meet app</li>
        <li>Discussion of feedback</li>
        <li>Decision whether to proceed</li>
        <li>Next steps</li>
      </ol>
    </p>`;

    // TODO Figure out the best account to call this person
    let meeting = getAccount().newMeeting();
    await meeting.createNewConference();
    meeting.state = MeetingState.OutgoingCallConfirm;
    meeting.event = event;
    meeting.participants.add(callee);
    appGlobal.meetings.add(meeting);
    meeting.videos.add(new VideoStream(new MediaStream(), callee));
    let self = new VideoStream(new MediaStream());
    self.isMe = true;
    meeting.videos.add(self);
    // meeting.myParticipant.role = ParticipantRole.Moderator;
  }

  let conferenceURL: string;

  async function joinByURL() {
    let meeting = await joinConferenceByURL(conferenceURL);
    appGlobal.meetings.add(meeting);
  }

  async function joinURLPasted() {
    await sleep(0.1); // paste event fires before the input event, which clears the error
    await joinByURL();
  }

  let errorMsg: string | null = null;

  function showError(ex: Error) {
    errorMsg = ex.message ?? ex + "";
    logError(ex);
  }
</script>

<style>
  .actions-container {
    align-items: center;
    justify-content: center;
    flex: 2 0 0;
  }
  .actions :global(> *) {
    margin-block-start: 12px;
  }
  .actions :global(.call-person .avatar) {
    margin: -4px 0px;
  }
  .actions-container .error {
    position: absolute;
    bottom: 100px;
  }
  .test {
    align-self: end;
  }
  .test:not(:hover) :global(.buttons.top-right) {
    visibility: hidden;
  }
  .test .buttons {
    margin-block-end: 12px;
  }
  .test .buttons :global(> *) {
    margin-block-end: 12px;
  }
  .meeting-link {
    margin-inline-end: 4px;
  }
  .meetings {
    justify-content: center;
  }
  .upcoming,
  .previous {
    justify-content: center;
  }
  .title {
    font-weight: bold;
    margin-block-end: 12px;
  }
  .emptyMsg {
    color: grey;
  }
</style>
