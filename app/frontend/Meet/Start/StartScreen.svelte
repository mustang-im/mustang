<hbox flex>
  <vbox flex class="actions-container">
    <vbox class="actions">
      {#if $selectedPerson}
        <Button label="Call {$selectedPerson.name}" on:click={() => catchErrors(callSelected)} classes="call-person">
          <PersonPicture slot="icon" person={$selectedPerson} size={24} />
        </Button>
        <Button label="Test incoming call" icon={VideoIcon} on:click={() => catchErrors(testIncoming)}/>
      {/if}
      <Button label="Plan a meeting" icon={AddToCalendarIcon} />
      <Button label="Start an ad-hoc meeting" icon={VideoIcon} on:click={() => catchErrors(startAdHocMeeting)}/>
      <hbox>
        <input id="meeting-link" type="url" placeholder="Enter meeting link to join" />
        <Button label="Join" />
      </hbox>
    </vbox>
  </vbox>
  <vbox flex class="meetings">
    <vbox flex class="upcoming">
      <hbox class="title">Today's next meetings</hbox>
      <MeetingList meetings={upcomingMeetings}>
        <div slot="emptyMsg" class="emptyMsg">No meetings coming up</div>
      </MeetingList>
    </vbox>
    <vbox flex class="previous">
      <hbox class="title">Previous meetings</hbox>
      <MeetingList meetings={previousMeetings}>
        <div slot="emptyMsg" class="emptyMsg">No recent meetings</div>
      </MeetingList>
    </vbox>
  </vbox>
</hbox>

<script lang="ts">
  import { MeetingState, VideoConfMeeting } from "../../../logic/Meet/VideoConfMeeting";
  import { ParticipantVideo, SelfVideo } from "../../../logic/Meet/VideoStream";
  import { MeetingParticipant, ParticipantRole } from "../../../logic/Meet/Participant";
  import { selectedPerson } from "../../Shared/Person/PersonOrGroup";
  import { appGlobal } from "../../../logic/app";
  import MeetingList from "./MeetingList.svelte";
  import Button from "../../Shared/Button.svelte";
  import VideoIcon from 'lucide-svelte/icons/video';
  import AddToCalendarIcon from "lucide-svelte/icons/calendar-plus";
  import PersonPicture from "../../Shared/Person/PersonPicture.svelte";
  import { OTalkConf } from "../../../logic/Meet/OTalkConf";
  import { catchErrors } from "../../Util/error";
  import { mergeColls } from "svelte-collections";
  import { Event } from "../../../logic/Calendar/Event";
  import { faker } from "@faker-js/faker";

  const allEvents = mergeColls(appGlobal.calendars.map(calendar => calendar.events).values());
  const now = new Date();
  const maxUpcoming = new Date(); // TODO now + 8 hours
  const maxPrevious = new Date(); // TODO now - 14 days
  const upcomingMeetings = allEvents.filter(event => event.startTime > now && event.startTime < maxUpcoming);
  const previousMeetings = allEvents.filter(event => event.startTime < now && event.startTime > maxPrevious);

  async function startAdHocMeeting() {
    let meeting = await OTalkConf.createAdhoc();
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
    event.title = "Final Approval UX Meet";
    event.descriptionHTML = `<p>
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
  #meeting-link {
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
