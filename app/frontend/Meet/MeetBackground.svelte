<svelte:window
  on:url-tel|capture={event => catchErrors(() => onMeetingURL(event, event.url))}
  on:url-https|capture={event => catchErrors(() => onMeetingURL(event, event.url))} />

<script lang="ts">
  import { MeetingState } from "../../logic/Meet/VideoConfMeeting";
  import { openApp, selectedApp } from "../AppsBar/selectedApp";
  import { meetMustangApp } from "./MeetMustangApp";
  import { appGlobal } from "../../logic/app";
  import { catchErrors } from "../Util/error";

  // HACK: Why are some ended meetings not removed? See `VideoConfMeeting.hangup()`
  $: meetings = appGlobal.meetings.filterObservable(m => m.state != MeetingState.Ended);

  /** Open sidebar, if meeting is ongoing */
  $: meetMustangApp.showSidebar = $meetings.hasItems && $selectedApp != meetMustangApp && !window.location.pathname.startsWith("/meet");

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

  async function onMeetingURL(event: Event, url: string) {
    let urlParsed = new URL(url);
    let acc = appGlobal.meetAccounts.find(acc => acc.isMeetingURL(urlParsed));
    if (!acc) {
      return;
    }
    event.stopPropagation();
    let meeting = await acc.openMeetingURL(url);
    openApp(meetMustangApp, { meeting });
  }
</script>
