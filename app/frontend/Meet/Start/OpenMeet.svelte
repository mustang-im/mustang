<script lang="ts">
  import { MeetingState } from "../../../logic/Meet/VideoConfMeeting";
  import { AppArea, selectedApp } from "../../AppsBar/app";
  import { appGlobal } from "../../../logic/app";

  /** When a call comes in or is placed, open the meet app,
   * which will then open the Calling screen. */

  $: meetings = appGlobal.meetings;
  $: meeting = $meetings.first;
  $: meeting && openMeet();
  function openMeet() {
    if (meeting.state == MeetingState.OutgoingCallPrepare ||
        meeting.state == MeetingState.OutgoingCall ||
        meeting.state == MeetingState.IncomingCall) {
      $selectedApp = AppArea.Meet;
    }
  }
</script>
