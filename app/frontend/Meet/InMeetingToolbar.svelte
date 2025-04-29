<hbox class="actions">
  {#if isSidebar}
    <RoundButton
      label={$t`Go back to meeting`}
      classes="back-to-meet secondary"
      on:click={() => openApp(meetMustangApp)}
      icon={OpenToLeftIcon}
      iconSize="16px"
      border={false}
      />
      <hbox flex />
  {/if}
  <RoundButton
    label={$t`Screen share`}
    classes="screen-share large"
    selected={$screenShareOn}
    onClick={toggleScreenShare}
    icon={$screenShareOn ? ScreenShareIcon : ScreenShareOffIcon}
    iconSize="24px"
    border={false}
    />
  <RoundButton
    label={$t`Camera`}
    classes="camera large"
    selected={$cameraOn}
    onClick={toggleCamera}
    icon={$cameraOn ? CameraIcon : CameraOffIcon}
    iconSize="24px"
    border={false}
    />
    <RoundButton
    label={$t`Mute`}
    classes="mic large"
    selected={$micOn}
    onClick={toggleMic}
    icon={$micOn ? MicrophoneIcon : MicrophoneOffIcon}
    iconSize="24px"
    border={false}
    />
  <hbox flex />
  <RoundButton
    label={handRaised ? $t`Hand raised` : $t`Raise hand`}
    classes="hand large"
    selected={handRaised}
    onClick={toggleHand}
    icon={handRaised ? HandIcon : HandDownIcon}
    iconSize="24px"
    border={false}
    />
  {#if !isSidebar}
    <RoundButton
      label={$t`Leave`}
      classes="leave large"
      onClick={leave}
      icon={LeaveIcon}
      iconSize="24px"
      border={false}
      />
  {/if}
  <hbox flex />
  {#if !isSidebar}
    <RoundButton
      label={showSidebar ? $t`Close participants list` : $t`Open participants list`}
      classes="sidebar secondary large"
      onClick={() => showSidebar = !showSidebar}
      icon={showSidebar ? CloseSidebarIcon : OpenSidebarIcon}
      iconSize="24px"
      border={false}
      />
  {/if}
</hbox>

<script lang="ts">
  import type { VideoConfMeeting } from "../../logic/Meet/VideoConfMeeting";
  import { cameraOn, micOn, screenShareOn } from "./Setup/selectedDevices";
  import { meetMustangApp } from "./MeetMustangApp";
  import { openApp } from "../AppsBar/selectedApp";
  import { appGlobal } from "../../logic/app";
  import RoundButton from "../Shared/RoundButton.svelte";
  import HandIcon from '../asset/icon/meet/hand.svg?raw';
  import HandDownIcon from "lucide-svelte/icons/grab";
  import CameraIcon from "lucide-svelte/icons/video";
  import CameraOffIcon from "lucide-svelte/icons/video-off";
  import MicrophoneIcon from "lucide-svelte/icons/mic";
  import MicrophoneOffIcon from "lucide-svelte/icons/mic-off";
  import ScreenShareIcon from "lucide-svelte/icons/screen-share-off";
  import ScreenShareOffIcon from "lucide-svelte/icons/screen-share";
  import LeaveIcon from "lucide-svelte/icons/phone";
  import OpenSidebarIcon from "lucide-svelte/icons/users-round";
  import OpenToLeftIcon from "lucide-svelte/icons/arrow-left-from-line";
  import CloseSidebarIcon from "lucide-svelte/icons/arrow-right-from-line";
  import { t } from "../../l10n/l10n";

  export let meeting: VideoConfMeeting;
  export let isSidebar = false;
  export let showSidebar = false; /* in/out */

  let handRaised = false;
  let cameraStream: MediaStream = null;
  let screenStream: MediaStream = null;

  async function leave() {
    await meeting.hangup();
    await stopCamera();
    await stopScreenShare();
    appGlobal.meetings.remove(meeting);
  }

  async function toggleHand() {
    await meeting.setHandRaised(!meeting.handRaised);
  }

  function toggleMic() {
    $micOn = !$micOn;
  }

  async function toggleCamera() {
    $cameraOn = !$cameraOn;

    if ($cameraOn && !cameraStream) {
      await startCamera();
    }
    if (!$cameraOn && cameraStream) {
      await stopCamera();
    }
  }

  async function toggleScreenShare() {
    $screenShareOn = !$screenShareOn;

    if ($screenShareOn && !screenStream) {
      await startScreenShare();
    }
    if (!$screenShareOn && screenStream) {
      await stopScreenShare();
    }
  }

  async function startCamera() {
    cameraStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    if (!cameraStream) {
      return;
    }
    await meeting.setCamera(cameraStream);
    // setCamera() also creates `SelfVideo` in `meeting.videos`
  }

  async function stopCamera() {
    if (!cameraStream) {
      return;
    }
    for (let track of cameraStream.getTracks()) {
      track.stop();
    }
    await meeting.setCamera(null);
    // setCamera(null) also removes `SelfVideo` from `meeting.videos`
    cameraStream = null;
  }

  async function startScreenShare() {
    // <https://developer.mozilla.org/en-US/docs/Web/API/Screen_Capture_API/Using_Screen_Capture>
    screenStream = await navigator.mediaDevices.getDisplayMedia();
    if (!screenStream) {
      return;
    }
    await meeting.setScreenShare(screenStream);
    // setScreenShare() also creates `ScreenShare` in `meeting.videos`
  }

  async function stopScreenShare() {
    if (!screenStream) {
      return;
    }
    for (let track of screenStream.getTracks()) {
      track.stop();
    }
    await meeting.setScreenShare(null);
    // setScreenShare(null) also removes `ScreenShare` from `meeting.videos`
    screenStream = null;
  }
</script>

<style>
  .actions {
    margin: 8px;
  }
  .actions :global(> *) {
    margin-inline-end: 8px;
  }
  .actions :global(.leave svg) {
    transform: rotate(135deg);
  }
  .actions :global(.leave:hover) {
    background-color: #F34949;
  }
  .actions :global(.hand svg) {
    fill: none;
  }
  .actions :global(.hand.selected svg) {
    fill: tan;
  }
  .actions :global(.hand.selected) {
    background-color: #20AE9E;
    animation-name: color;
        animation-duration: 1s;
        animation-iteration-count: infinite;
        animation-direction: alternate-reverse;
        animation-timing-function: ease;
  }
  @keyframes color {
    to {
      background-color: #A3E5DD;
    }
  }
  .actions :global(button.secondary:not(:hover)) {
    background-color: transparent;
    color: white;
  }
</style>
