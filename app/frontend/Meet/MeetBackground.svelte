<script lang="ts">
  import { MeetingState } from "../../logic/Meet/VideoConfMeeting";
  import { openApp, selectedApp } from "../AppsBar/selectedApp";
  import { meetMustangApp } from "./MeetMustangApp";
  import { appGlobal } from "../../logic/app";

  $: meetings = appGlobal.meetings;

  /** Open sidebar, if meeting is ongoing */
  $: meetMustangApp.showSidebar = $meetings.hasItems && $selectedApp != meetMustangApp && !window.location.href.startsWith("/meet");

  /** When a call comes in or is placed, open the meet app,
   * which will then open the Calling screen. */
  $: meeting = $meetings.first;
  $: meeting && openMeet();
  function openMeet() {
    if (meeting.state == MeetingState.OutgoingCallConfirm ||
        meeting.state == MeetingState.OutgoingCall ||
        meeting.state == MeetingState.IncomingCall) {
      openApp(meetMustangApp, { meeting });
    }
  }
</script>
