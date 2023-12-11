<hbox flex>
  <vbox flex class="actions-container">
    <vbox class="actions">
      {#if $selectedPerson}
        <Button label="Call {$selectedPerson.name}" on:click={callSelected} classes="call-person">
          <PersonPicture slot="icon" person={$selectedPerson} size={24} />
        </Button>
      {/if}
      <Button label="Plan a meeting" icon={AddToCalendarIcon} />
      <Button label="Start an ad-hoc meeting" icon={VideoIcon} on:click={startAdHocMeeting}/>
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
  import { VideoConfMeeting } from "../../../logic/Meet/VideoConfMeeting";
  import { ParticipantVideo, SelfVideo } from "../../../logic/Meet/VideoStream";
  import { selectedPerson } from "../../Shared/Person/PersonOrGroup";
  import { appGlobal } from "../../../logic/app";
  import MeetingList from "./MeetingList.svelte";
  import Button from "../../Shared/Button.svelte";
  import VideoIcon from 'lucide-svelte/icons/video';
  import AddToCalendarIcon from "lucide-svelte/icons/calendar-plus";
  import PersonPicture from "../../Shared/Person/PersonPicture.svelte";

  const now = new Date();
  const maxUpcoming = new Date(); // TODO now + 8 hours
  const maxPrevious = new Date(); // TODO now - 14 days
  const upcomingMeetings = appGlobal.calendars.map(calendar => calendar.events.filter(event => event.startTime > now && event.startTime < maxUpcoming));
  const previousMeetings = appGlobal.calendars.map(calendar => calendar.events.filter(event => event.startTime < now && event.startTime > maxPrevious));

  async function startAdHocMeeting() {
    let meeting = await VideoConfMeeting.createAdhoc(null);
    appGlobal.meetings.add(meeting);
    meeting.videos.add(new SelfVideo(new MediaStream()));
  }

  async function callSelected() {
    let meeting = await VideoConfMeeting.createAdhoc(null);
    meeting.participants.add($selectedPerson);
    appGlobal.meetings.add(meeting);
    meeting.videos.add(new ParticipantVideo(new MediaStream(), $selectedPerson));
    meeting.videos.add(new SelfVideo(new MediaStream()));
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
  .actions :global(.call-person .image) {
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
