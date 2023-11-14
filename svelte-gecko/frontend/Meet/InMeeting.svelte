<vbox flex>
  <grid class="participants" style="grid-template-columns: {columns}">
    {#each $participants.each as participant (participant.id)}
      <Participant {participant} />
    {/each}
  </grid>
</vbox>
<hbox class="actions">
  <hbox flex />
  <Button label="Mute" classes="toggle-mic" iconOnly on:click={toggleMic} />
  <Button label="Camera" classes="toggle-camera" iconOnly on:click={toggleCamera} />
  <Button label="Hand" classes="raise-hand" iconOnly on:click={toggleHand} />
  <Button label="Add participant" classes="add-participant" on:click={addParticipant} />
  <hbox flex />
  <Button label="Leave" classes="leave" on:click={leave} />
</hbox>

<script lang="ts">
  import type { VideoConfMeeting } from "../../logic/Meet/VideoConfMeeting";
  import { appGlobal } from "../../logic/app";
  import Button from "../Shared/Button.svelte";
  import Participant from "./Participant.svelte";

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
</style>
