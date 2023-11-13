<hbox flex>
  <vbox flex class="actions-container">
    <vbox class="actions">
      <Button label="Plan a meeting" icon={add} />
      <Button label="Start an ad-hoc meeting" icon={camera} />
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
  <vbox class="end">
    <Button icon={settings} plain iconSize="32px" classes="settings" />
  </vbox>
</hbox>

<script lang="ts">
  import { appGlobal } from "../../../logic/app";
  import MeetingList from "./MeetingList.svelte";
  import Button from "../../Shared/Button.svelte";
  import camera from '../../asset/icon/meet/videoCall.svg?raw';
  import add from '../../asset/icon/calendar/addToCalendar.svg?raw';
  import settings from '../../asset/icon/general/settings.svg?raw';

  const now = new Date();
  const maxUpcoming = new Date(); // TODO now + 8 hours
  const maxPrevious = new Date(); // TODO now - 14 days
  const upcomingMeetings = appGlobal.calendars.map(calendar => calendar.events.filter(event => event.startTime > now && event.startTime < maxUpcoming));
  const previousMeetings = appGlobal.calendars.map(calendar => calendar.events.filter(event => event.startTime < now && event.startTime > maxPrevious));
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
  .end :global(.settings) {
    margin: 24px;
  }
</style>
