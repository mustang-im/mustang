<vbox flex class="participants-sidebar">
  <vbox class="participants-header">
    <hbox class="number">{$participants.length} Participants</hbox>
  </vbox>
  <PersonsList persons={$participantsSorted} bind:selected>
    <hbox slot="top-right" class="actions" let:person={participant}>
      {#if isModerator && participant instanceof MeetingParticipant}
        {#if participant.handUp}
          <Button plain
            classes={participant.handUp ? "hand-up" : "hand-down"}
            label={participant.handUp ? "Take hand down" : ""}
            on:click={() => catchErrors(() => toggleHand(participant))}
            icon={participant.handUp ? HandIcon : HandDownIcon}
            iconOnly />
        {/if}
        <hbox class="more-actions">
          <Button plain
            classes="toggle-mic"
            label="Mute"
            on:click={() => catchErrors(() => toggleMic(participant))}
            icon={participant.micOn ? MicrophoneOffIcon : MicrophoneIcon}
            iconOnly />
          <Button plain
            classes="toggle-camera"
            label="Camera"
            on:click={() => catchErrors(() => toggleCamera(participant))}
            icon={participant.cameraOn ? CameraOffIcon : CameraIcon}
            iconOnly />
        </hbox>
      {/if}
    </hbox>
  </PersonsList>
</vbox>

<script lang="ts">
  import { MeetingParticipant } from "../../logic/Meet/Participant";
  import type { Collection } from "svelte-collections";
  import PersonsList from "../Shared/Person/PersonsList.svelte";
  import Button from "../Shared/Button.svelte";
  import HandIcon from '../asset/icon/meet/hand.svg?raw';
  import HandDownIcon from "lucide-svelte/icons/grab";
  import CameraIcon from "lucide-svelte/icons/video";
  import CameraOffIcon from "lucide-svelte/icons/video-off";
  import MicrophoneIcon from "lucide-svelte/icons/mic";
  import MicrophoneOffIcon from "lucide-svelte/icons/mic-off";
  import { catchErrors } from "../Util/error";
  import { assert } from "../../logic/util/util";

  export let participants: Collection<MeetingParticipant>;
  export let selected: MeetingParticipant;
  export let isModerator = false;

  $: participantsSorted = $participants
    .sortBy(person => person.role)
    .sortBy(person => person.handUp);

  /////////////
  // Moderator functions

  function toggleHand(participant: MeetingParticipant) {
    assert(isModerator, "You are not a moderator");
    if (!participant.handUp) {
      return;
    }
    // TODO send to server
    participant.handUp = false;
  }
  function toggleCamera(participant: MeetingParticipant) {
    assert(isModerator, "You are not a moderator");
    if (participant.cameraOn) {
      // TODO Turn camera off on server
    } else {
      // TODO Request user to turn on camera
    }
    participant.cameraOn = !participant.cameraOn;
  }
  function toggleMic(participant: MeetingParticipant) {
    assert(isModerator, "You are not a moderator");
    // See camera above
    participant.micOn = !participant.micOn;
  }
</script>

<style>
  .participants-header {
    margin: 8px 0;
    align-items: center;
    font-size: 15px;
  }
  .participants-sidebar :global(.person img) {
    width: 24px;
    height: 24px;
  }
  :global(.person:not(:hover)) .more-actions {
    visibility: hidden;
  }
  :global(.person:hover) .actions :global(svg) {
    stroke: white;
  }
</style>
