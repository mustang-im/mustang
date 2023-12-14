<hbox flex>
  <vbox flex class="main">
    <Gallery videos={meeting.videos} {showSelf}  />
    <hbox class="actions">
      <hbox flex />
      <Button label="Mute" classes="toggle-mic" on:click={() => catchErrors(toggleMic)} icon={micOn ? MicrophoneOffIcon : MicrophoneIcon} iconOnly />
      <Button label="Camera" classes="toggle-camera" on:click={() => catchErrors(toggleCamera)} icon={cameraOn ? CameraOffIcon : CameraIcon} iconOnly />
      <Button label={handRaised ? "Hand raised" : "Raise hand"} classes={handRaised ? "raised-hand" : "raise-hand"} on:click={() => catchErrors(toggleHand)} icon={handRaised ? HandIcon : HandDownIcon} iconOnly />
      {#if $selectedApp == AppArea.Meet}
        <Button label="Leave" classes="leave" on:click={() => catchErrors(leave)} icon={LeaveIcon} iconOnly />
      {/if}
      <hbox flex />
    </hbox>
  </vbox>
  <vbox flex class="sidebar">
    <ParticipantsSidebar
      {meeting}
      participants={meeting.participants}
      bind:selected={selectedParticipant}
      isModerator={meeting.myRole == "moderator"}
      />
  </vbox>
</hbox>

<script lang="ts">
  import type { VideoConfMeeting } from "../../logic/Meet/VideoConfMeeting";
  import type { MeetingParticipant } from "../../logic/Meet/Participant";
  import { AppArea, selectedApp } from "../MainWindow/app";
  import { appGlobal } from "../../logic/app";
  import Gallery from "./Gallery.svelte";
  import ParticipantsSidebar from "./ParticipantsSidebar.svelte";
  import Button from "../Shared/Button.svelte";
  import HandIcon from '../asset/icon/meet/hand.svg?raw';
  import HandDownIcon from "lucide-svelte/icons/grab";
  import CameraIcon from "lucide-svelte/icons/video";
  import CameraOffIcon from "lucide-svelte/icons/video-off";
  import MicrophoneIcon from "lucide-svelte/icons/mic";
  import MicrophoneOffIcon from "lucide-svelte/icons/mic-off";
  import AddUserIcon from "lucide-svelte/icons/user-round-plus";
  import LeaveIcon from "lucide-svelte/icons/phone-outgoing";
  import { catchErrors } from "../Util/error";

  export let meeting: VideoConfMeeting;

  let micOn = false;
  let cameraOn = false;
  let handRaised = false;
  let showSelf = true;
  let cameraStream: MediaStream = null;

  let selectedParticipant: MeetingParticipant = null;

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
  }

  function toggleHand() {
    handRaised = !handRaised;
  }

  async function startCamera() {
    cameraStream = await navigator.mediaDevices.getUserMedia();
    if (!cameraStream) {
      return;
    }
    meeting.setCamera(cameraStream);
  }
</script>

<style>
  .sidebar {
    max-width: 350px;
  }
  .actions {
    margin: 8px;
  }
  .actions :global(> *) {
    margin-right: 4px;
  }
  .actions :global(button.leave) {
    background-color: #FF7777;
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
  }
</style>
