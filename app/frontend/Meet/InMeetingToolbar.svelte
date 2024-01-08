<hbox class="actions">
  {#if isSidebar}
    <Button plain
      label="Go back to meeting"
      classes="back-to-meet"
      on:click={() => $selectedApp = AppArea.Meet}
      icon={OpenToLeftIcon}
      iconSize="16px"
      iconOnly
      />
  {/if}
  <hbox flex />
  <RoundButton
    label="Mute"
    classes="toggle-mic"
    on:click={() => catchErrors(toggleMic)}
    icon={micOn ? MicrophoneIcon : MicrophoneOffIcon}
    iconSize="24px"
    border={false}
    />
  <RoundButton
    label="Camera"
    classes="toggle-camera"
    on:click={() => catchErrors(toggleCamera)}
    icon={cameraOn ? CameraIcon : CameraOffIcon}
    iconSize="24px"
    border={false}
    />
  <RoundButton
    label={handRaised ? "Hand raised" : "Raise hand"}
    classes={handRaised ? "raised-hand" : "raise-hand"}
    on:click={() => catchErrors(toggleHand)}
    icon={handRaised ? HandIcon : HandDownIcon}
    iconSize="24px"
    border={false}
    />
  {#if !isSidebar}
    <RoundButton
      label="Leave"
      classes="leave"
      on:click={() => catchErrors(leave)}
      icon={LeaveIcon}
      iconSize="24px"
      border={false}
      />
  {/if}
  <hbox flex />
  {#if !isSidebar}
    <Button plain
      label={showSidebar ? "Close participants list" : "Open participants list"}
      classes="sidebar"
      on:click={() => showSidebar = !showSidebar}
      icon={showSidebar ? CloseSidebarIcon : OpenSidebarIcon}
      iconSize="24px"
      iconOnly
      />
  {/if}
</hbox>

<script lang="ts">
  import type { VideoConfMeeting } from "../../logic/Meet/VideoConfMeeting";
  import { AppArea, selectedApp } from "../MainWindow/app";
  import { appGlobal } from "../../logic/app";
  import Button from "../Shared/Button.svelte";
  import RoundButton from "../Shared/RoundButton.svelte";
  import HandIcon from '../asset/icon/meet/hand.svg?raw';
  import HandDownIcon from "lucide-svelte/icons/grab";
  import CameraIcon from "lucide-svelte/icons/video";
  import CameraOffIcon from "lucide-svelte/icons/video-off";
  import MicrophoneIcon from "lucide-svelte/icons/mic";
  import MicrophoneOffIcon from "lucide-svelte/icons/mic-off";
  import LeaveIcon from "lucide-svelte/icons/phone";
  import OpenSidebarIcon from "lucide-svelte/icons/users-round";
  import OpenToLeftIcon from "lucide-svelte/icons/arrow-left-from-line";
  import CloseSidebarIcon from "lucide-svelte/icons/arrow-right-from-line";
  import { catchErrors } from "../Util/error";

  export let meeting: VideoConfMeeting;
  export let isSidebar = false;
  export let showSidebar = false; /* in/out */

  let micOn = false;
  let cameraOn = false;
  let handRaised = false;
  let cameraStream: MediaStream = null;

  async function leave() {
    await meeting.hangup();
    appGlobal.meetings.remove(meeting);
  }

  function toggleMic() {
    micOn = !micOn;
  }

  async function toggleCamera() {
    cameraOn = !cameraOn;

    if (cameraOn && !cameraStream) {
      await startCamera();
    }
    if (!cameraOn && cameraStream) {
      await stopCamera();
    }
  }

  function toggleHand() {
    handRaised = !handRaised;
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
    for (let track of cameraStream.getTracks()) {
      track.stop();
    }
    await meeting.setCamera(null);
    // setCamera(null) also removes `SelfVideo` from `meeting.videos`
    cameraStream = null;
  }
</script>

<style>
  .actions {
    margin: 8px;
  }
  .actions :global(> *) {
    margin-right: 8px;
  }
  .actions :global(button.leave) {
    background-color: #F34949;
  }
  /*.actions :global(.toggle-camera svg),
  .actions :global(.toggle-mic svg) {
    fill: black;
  }*/
  .actions :global(.raised-hand svg) {
    fill: tan;
  }
  .actions :global(.raise-hand svg) {
    fill: none;
  }
  .actions :global(.raised-hand svg) {
    fill: tan;
  }
  .actions :global(button.raised-hand) {
    background-color: yellowgreen;
    animation-name: color;
        animation-duration: 1s;
        animation-iteration-count: infinite;
        animation-direction: alternate-reverse;
        animation-timing-function: ease;
  }
  @keyframes color {
    to {
      background-color: transparent;
    }
  }
  .actions :global(.leave svg) {
    transform: rotate(135deg);
    stroke: white;
  }
  .actions :global(button.plain) {
    color: white;
  }
</style>
