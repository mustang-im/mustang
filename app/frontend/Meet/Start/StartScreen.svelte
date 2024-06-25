<hbox flex>
  <vbox flex class="actions-container">
    <vbox class="actions">
      {#if $selectedPerson}
        <Button label={$t`Call ${$selectedPerson.name}`} onClick={callSelected} classes="call-person secondary">
          <PersonPicture slot="icon" person={$selectedPerson} size={24} />
        </Button>
        <Button label={$t`Test incoming call`} icon={VideoIcon} onClick={testIncoming} classes="secondary" />
      {/if}
      <Button label={$t`Plan a meeting`} icon={AddToCalendarIcon} classes="secondary" iconSize="14px" />
      <Button label={$t`Start an ad-hoc meeting`} icon={VideoIcon} onClick={startAdHocMeeting} classes="secondary" />
      <hbox>
        <input class="meeting-link" type="url" bind:value={conferenceURL} placeholder={$t`Enter meeting link to join`} />
        <Button label={$t`Join`} classes="secondary"
          onClick={joinByURL} />
      </hbox>
    </vbox>
  </vbox>
  <vbox flex class="meetings">
    <vbox flex class="upcoming">
      <hbox class="title">{$t`Today's next meetings`}</hbox>
      <MeetingList meetings={upcomingMeetings}>
        <div slot="emptyMsg" class="emptyMsg">{$t`No meetings coming up`}</div>
      </MeetingList>
    </vbox>
    <vbox flex class="previous">
      <hbox class="title">{$t`Previous meetings`}</hbox>
      <MeetingList meetings={previousMeetings}>
        <div slot="emptyMsg" class="emptyMsg">{$t`No recent meetings`}</div>
      </MeetingList>
    </vbox>
  </vbox>
</hbox>

<script lang="ts">
  import { MeetingState, VideoConfMeeting } from "../../../logic/Meet/VideoConfMeeting";
  import { ParticipantVideo, SelfVideo } from "../../../logic/Meet/VideoStream";
  import { MeetingParticipant, ParticipantRole } from "../../../logic/Meet/Participant";
  import { selectedPerson } from "../../Shared/Person/Selected";
  import { joinConferenceByURL } from "../../../logic/Meet/StartCall";
  import { appGlobal } from "../../../logic/app";
  import MeetingList from "./MeetingList.svelte";
  import Button from "../../Shared/Button.svelte";
  import VideoIcon from 'lucide-svelte/icons/video';
  import AddToCalendarIcon from "lucide-svelte/icons/calendar-plus";
  import PersonPicture from "../../Shared/Person/PersonPicture.svelte";
  import { M3Conf } from "../../../logic/Meet/M3Conf";
  import { mergeColls } from "svelte-collections";
  import { Event } from "../../../logic/Calendar/Event";
  import { faker } from "@faker-js/faker";
  import { t } from "svelte-i18n-lingui";

  const allEvents = mergeColls(appGlobal.calendars.map(calendar => calendar.events));
  const now = new Date();
  const maxUpcoming = new Date(); // TODO now + 8 hours
  const maxPrevious = new Date(); // TODO now - 14 days
  const upcomingMeetings = allEvents.filter(event => event.startTime > now && event.startTime < maxUpcoming);
  const previousMeetings = allEvents.filter(event => event.startTime < now && event.startTime > maxPrevious);

  async function startAdHocMeeting() {
    let meeting = await M3Conf.createAdhoc();
    appGlobal.meetings.add(meeting);
  }

  async function testIncoming() {
    let fakeMeeting = new Event();
    fakeMeeting.startTime = faker.date.soon(1/24/4);
    fakeMeeting.endTime = faker.date.soon(1/24);
    fakeMeeting.title = faker.random.words();
    fakeMeeting.descriptionText = faker.random.words();
    appGlobal.calendars.first.events.add(fakeMeeting);

    let caller = new MeetingParticipant();
    caller.name = $selectedPerson.name;
    caller.picture = $selectedPerson.picture;
    let meeting = await VideoConfMeeting.createAdhoc();
    meeting.state = MeetingState.IncomingCall;
    meeting.participants.add(caller);
    appGlobal.meetings.add(meeting);
  }

  async function callSelected() {
    let callee = new MeetingParticipant();
    callee.name = $selectedPerson.name;
    callee.picture = $selectedPerson.picture;

    let event = new Event();
    event.startTime = faker.date.past(0.001);
    event.endTime = faker.date.future(0.001);
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

    let meeting = await VideoConfMeeting.createAdhoc();
    meeting.state = MeetingState.OutgoingCallPrepare;
    meeting.event = event;
    meeting.participants.add(callee);
    appGlobal.meetings.add(meeting);
    meeting.videos.add(new ParticipantVideo(new MediaStream(), callee));
    meeting.videos.add(new SelfVideo(new MediaStream()));
    // meeting.myParticipant.role = ParticipantRole.Moderator;
  }

  let conferenceURL: string;

  async function joinByURL() {
    let meeting = await joinConferenceByURL(conferenceURL);
    appGlobal.meetings.add(meeting);
  }
</script>

<style>
  .actions-container {
    align-items: center;
    justify-content: center;
    flex: 2 0 0;
  }
  .actions :global(> *) {
    margin-top: 12px;
  }
  .actions :global(.call-person .avatar) {
    margin: -4px 0px;
  }
  .meeting-link {
    margin-right: 4px;
  }
  .meetings {
    justify-content: center;
  }
  .upcoming,
  .previous {
    justify-content: center;
  }
  .title {
    font-size: 14px;
    font-weight: bold;
    margin-bottom: 12px;
  }
  .emptyMsg {
    font-size: 12px;
    color: grey;
  }
</style>
