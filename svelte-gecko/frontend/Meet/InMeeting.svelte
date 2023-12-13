<vbox flex>
  <Gallery videos={meeting.videos} {showSelf}  />
</vbox>
<hbox class="actions">
  <hbox flex />
  <Button label="Mute" classes="toggle-mic" on:click={() => catchErrors(toggleMic)} icon={micOn ? MicrophoneOffIcon : MicrophoneIcon} iconOnly />
  <Button label="Camera" classes="toggle-camera" on:click={() => catchErrors(toggleCamera)} icon={cameraOn ? CameraOffIcon : CameraIcon} iconOnly />
  <Button label={handRaised ? "Hand raised" : "Raise hand"} classes={handRaised ? "raised-hand" : "raise-hand"} on:click={() => catchErrors(toggleHand)} icon={handRaised ? HandIcon : HandDownIcon} iconOnly />
  {#if $selectedApp == AppArea.Meet}
    <Button label="Add participant" classes="add-participant" on:click={() => catchErrors(addParticipant)} icon={AddUserIcon} iconOnly />
    <Button label="Copy invitation link" classes="invite-participant" on:click={() => catchErrors(inviteParticipant)} icon={InviteUserIcon} iconOnly />
    <Button label="Leave" classes="leave" on:click={() => catchErrors(leave)} icon={LeaveIcon} iconOnly />
  {/if}
  <hbox flex />
</hbox>

<script lang="ts">
  import type { VideoConfMeeting } from "../../logic/Meet/VideoConfMeeting";
  import { ParticipantVideo } from "../../logic/Meet/VideoStream";
  import { AppArea, selectedApp } from "../MainWindow/app";
  import { appGlobal } from "../../logic/app";
  import Gallery from "./Gallery.svelte";
  import Button from "../Shared/Button.svelte";
  import HandIcon from '../asset/icon/meet/hand.svg?raw';
  import HandDownIcon from "lucide-svelte/icons/grab";
  import CameraIcon from "lucide-svelte/icons/video";
  import CameraOffIcon from "lucide-svelte/icons/video-off";
  import MicrophoneIcon from "lucide-svelte/icons/mic";
  import MicrophoneOffIcon from "lucide-svelte/icons/mic-off";
  import AddUserIcon from "lucide-svelte/icons/user-round-plus";
  import InviteUserIcon from "lucide-svelte/icons/link";
  import LeaveIcon from "lucide-svelte/icons/phone-outgoing";
  import { catchErrors } from "../Util/error";
  import { OTalkConf } from "../../logic/Meet/OTalkConf";

  export let meeting: VideoConfMeeting;

  let micOn = false;
  let cameraOn = false;
  let handRaised = false;
  let showSelf = true;
  let cameraStream: MediaStream = null;

  function addParticipant() {
    // TODO remove test data
    let chatAccount = appGlobal.chatAccounts.first;
    let participant = chatAccount.persons.at(Math.floor(chatAccount.persons.length) * Math.random());
    meeting.participants.add(participant);
    meeting.videos.add(new ParticipantVideo(new MediaStream(), participant));
  }

  async function inviteParticipant() {
    if (meeting instanceof OTalkConf) {
      let invitationURL = await meeting.getInvitationURL();
      navigator.clipboard.writeText(invitationURL);
    }
  }

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
    meeting.setCamera(cameraStream);
  }
</script>

<style>
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
