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
          <Menu>
            <Menu.Item
              on:click={() => catchErrors(() => startPrivateChat(participant))}
              title="Start a chat with only this person"
              icon={ChatIcon}>
              Private chat
            </Menu.Item>
          </Menu>
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
  import { Menu } from "@svelteuidev/core";
  import HandIcon from '../asset/icon/meet/hand.svg?raw';
  import HandDownIcon from "lucide-svelte/icons/grab";
  import CameraIcon from "lucide-svelte/icons/video";
  import CameraOffIcon from "lucide-svelte/icons/video-off";
  import MicrophoneIcon from "lucide-svelte/icons/mic";
  import MicrophoneOffIcon from "lucide-svelte/icons/mic-off";
  import ChatIcon from "lucide-svelte/icons/message-square";
  import { catchErrors } from "../Util/error";
  import { assert } from "../../logic/util/util";

  export let participants: Collection<MeetingParticipant>;
  export let selected: MeetingParticipant;
  export let isModerator = false;

  $: participantsSorted = $participants
    .sortBy(person => person.role)
    .sortBy(person => person.handUp);

  function startPrivateChat(participant: MeetingParticipant) {
  }

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
  .participants-sidebar :global(.person .main) {
    justify-content: center;
    padding: 0 12px 0 8px;
  }
  .participants-sidebar :global(.person .name) {
    align-items: center;
  }
  .participants-sidebar :global(.person .image) {
    margin: 2px 8px 2px 24px;
  }
  .participants-sidebar :global(.person img) {
    width: 24px;
    height: 24px;
  }
  :global(.person:not(:hover)) .more-actions :global(svg){
    stroke: black;
    stroke-width: 1px;
  }
  :global(.person.selected) .actions :global(svg),
  :global(.person:hover) .actions :global(svg) {
    stroke: white;
    stroke-width: 2px;
  }
  .more-actions :global(.svelteui-ActionIcon-root) {
    color: white;
    background-color: transparent;
  }
  .more-actions :global(.svelteui-ActionIcon-root:hover) {
    background-color: rgba(32, 174, 158, 50%); /* #20AE9E */
  }
</style>
