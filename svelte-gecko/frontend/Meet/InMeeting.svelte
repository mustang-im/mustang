<vbox flex>
  <Gallery videos={meeting.videos} {showSelf}  />
</vbox>
<hbox class="actions">
  <hbox flex />
  <Button label="Mute" classes="toggle-mic" on:click={toggleMic} icon={micOn ? MicrophoneOffIcon : MicrophoneIcon} iconOnly />
  <Button label="Camera" classes="toggle-camera" on:click={toggleCamera} icon={cameraOn ? CameraOffIcon : CameraIcon} iconOnly />
  <Button label="Hand" classes="raise-hand" on:click={toggleHand} icon={handRaised ? HandOffIcon : HandIcon} iconOnly />
  {#if $selectedApp == AppArea.Meet}
    <Button label="Add participant" classes="add-participant" on:click={addParticipant} icon={AddUserIcon} iconOnly />
    <Button label="Leave" classes="leave" on:click={leave} icon={LeaveIcon} iconOnly />
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
  import HandOffIcon from '../asset/icon/meet/handOff.svg?raw';
  import CameraIcon from "lucide-svelte/icons/video";
  import CameraOffIcon from "lucide-svelte/icons/video-off";
  import MicrophoneIcon from "lucide-svelte/icons/mic";
  import MicrophoneOffIcon from "lucide-svelte/icons/mic-off";
  import AddUserIcon from "lucide-svelte/icons/user-round-plus";
  import LeaveIcon from "lucide-svelte/icons/phone-outgoing";

  export let meeting: VideoConfMeeting;

  let micOn = false;
  let cameraOn = false;
  let handRaised = false;
  let showSelf = true;

  function addParticipant() {
    // TODO remove test data
    let chatAccount = appGlobal.chatAccounts.first;
    let participant = chatAccount.persons.at(Math.floor(chatAccount.persons.length) * Math.random());
    meeting.participants.add(participant);
    meeting.videos.add(new ParticipantVideo(new MediaStream(), participant));
  }

  async function leave() {
    await meeting.hangup();
    appGlobal.meetings.remove(meeting);
  }

  function toggleMic() {
    micOn = !micOn;
  }

  function toggleCamera() {
    cameraOn = !cameraOn;
  }

  function toggleHand() {
    handRaised = !handRaised;
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
  .actions :global(.leave svg) {
    transform: rotate(135deg);
  }
</style>
