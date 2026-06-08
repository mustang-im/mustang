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

  /** When a call comes in or is placed, open the meet app,
   * which will then open the Calling screen. */
  $: meeting = $meetings.first;
  $: meeting && openMeet();
  function openMeet() {
    console.log("Meeting state", meeting.state)
    if (meeting.state == MeetingState.OutgoingCallConfirm ||
        meeting.state == MeetingState.OutgoingCall ||
        meeting.state == MeetingState.IncomingCall) {
      openApp(meetMustangApp, { meeting });
    }
  }

  /** Open sidebar, if meeting is ongoing.
   * Note: Has to be after `openMeet()`, so that sets the correct state first */
  $: meetMustangApp.showSidebar = $meetings.hasItems && $selectedApp != meetMustangApp && !window.location.pathname.startsWith("/meet");

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
