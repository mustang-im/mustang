<vbox flex>
  <grid class="participants" style="grid-template-columns: {columns}">
    {#each $participants.each as participant (participant.id)}
      <Participant {participant} />
    {/each}
  </grid>
</vbox>
<hbox class="actions">
  <hbox flex />
  <Button label="Mute" classes="toggle-mic" on:click={toggleMic} icon={micOn ? MicrophoneOffIcon : MicrophoneIcon} iconOnly />
  <Button label="Camera" classes="toggle-camera" on:click={toggleCamera} icon={cameraOn ? CameraOffIcon : CameraIcon} iconOnly />
  <Button label="Hand" classes="raise-hand" on:click={toggleHand} icon={handRaised ? HandOffIcon : HandIcon} iconOnly />
  <Button label="Add participant" classes="add-participant" on:click={addParticipant} icon={AddUserIcon} iconOnly />
  <hbox flex />
  <Button label="Leave" classes="leave" on:click={leave} icon={LeaveIcon} iconOnly />
</hbox>

<script lang="ts">
  import type { VideoConfMeeting } from "../../logic/Meet/VideoConfMeeting";
  import { appGlobal } from "../../logic/app";
  import Button from "../Shared/Button.svelte";
  import Participant from "./Participant.svelte";
  import HandIcon from '../asset/icon/meet/hand.svg?raw';
  import HandOffIcon from '../asset/icon/meet/handOff.svg?raw';
  import CameraIcon from "lucide-svelte/icons/video";
  import CameraOffIcon from "lucide-svelte/icons/video-off";
  import MicrophoneIcon from "lucide-svelte/icons/mic";
  import MicrophoneOffIcon from "lucide-svelte/icons/mic-off";
  import AddUserIcon from "lucide-svelte/icons/user-round-plus";
  import LeaveIcon from "lucide-svelte/icons/phone-outgoing";

  export let meeting: VideoConfMeeting;

  $: participants = meeting.participants;
  let micOn = false;
  let cameraOn = false;
  let handRaised = false;

  $: columns = calculateColumns($participants.length);
  function calculateColumns(count: number) {
    if (count == 1) {
      return "auto";
    }
    if (count <= 4) {
      return "auto auto";
    }
    if (count <= 9) {
      return "auto auto auto";
    }
    if (count <= 16) {
      return "auto auto auto auto";
    }
    return "auto auto auto auto auto";
  }

  function addParticipant() {
    // TODO remove test data
    let chatAccount = appGlobal.chatAccounts.first;
    let participant = chatAccount.persons.at(Math.floor(chatAccount.persons.length) * Math.random());
    meeting.participants.add(participant);
  }

  function leave() {
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
  .participants {
    display: grid;
    /* grid-template-columns/rows: see code */
  }
  .actions {
    margin: 8px;
  }
  .actions :global(> *) {
    margin-right: 4px;
  }
  .actions :global(.leave) {
    background-color: #FF7777;
  }
  .actions :global(.raise-hand svg) {
    fill: none;
  }
  .actions :global(.leave svg) {
    transform: rotate(135deg);
  }
</style>
