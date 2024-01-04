<hbox class="actions">
  {#if participant instanceof MeetingParticipant}
    {#if participant.screenSharing}
      <Button plain
        classes="screen-sharing"
        icon={ScreenSharingIcon}
        disabled={true}
        iconOnly />
    {/if}
    {#if participant.handUp}
      <Button plain
        classes={$participant.handUp ? "hand-up" : "hand-down"}
        label={$participant.handUp ? "Take hand down" : ""}
        on:click={() => catchErrors(() => toggleHand(participant))}
        icon={$participant.handUp ? HandIcon : HandDownIcon}
        disabled={!userIsModerator}
        iconOnly />
    {/if}
    <hbox class="more-actions">
      <Button plain
        classes="toggle-mic"
        label="Mute"
        on:click={() => catchErrors(() => toggleMic(participant))}
        icon={$participant.micOn ? MicrophoneIcon : MicrophoneOffIcon}
        disabled={!userIsModerator}
        iconOnly />
      <Button plain
        classes="toggle-camera"
        label="Camera"
        on:click={() => catchErrors(() => toggleCamera(participant))}
        icon={$participant.cameraOn ? CameraIcon : CameraOffIcon}
        disabled={!userIsModerator}
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

<script lang="ts">
  import { MeetingParticipant } from "../../logic/Meet/Participant";
  import Button from "../Shared/Button.svelte";
  import { Menu } from "@svelteuidev/core";
  import HandIcon from '../asset/icon/meet/hand.svg?raw';
  import HandDownIcon from "lucide-svelte/icons/grab";
  import CameraIcon from "lucide-svelte/icons/video";
  import CameraOffIcon from "lucide-svelte/icons/video-off";
  import MicrophoneIcon from "lucide-svelte/icons/mic";
  import MicrophoneOffIcon from "lucide-svelte/icons/mic-off";
  import ChatIcon from "lucide-svelte/icons/message-square";
  import ScreenSharingIcon from "lucide-svelte/icons/monitor";
  import { catchErrors } from "../Util/error";
  import { assert } from "../../logic/util/util";

  export let participant: MeetingParticipant;
  export let userIsModerator = false;

  function startPrivateChat(participant: MeetingParticipant) {
  }

  /////////////
  // Moderator functions

  function toggleHand(participant: MeetingParticipant) {
    assert(userIsModerator, "You are not a moderator");
    if (!participant.handUp) {
      return;
    }
    // TODO send to server
    participant.handUp = false;
  }
  function toggleCamera(participant: MeetingParticipant) {
    assert(userIsModerator, "You are not a moderator");
    if (participant.cameraOn) {
      // TODO Turn camera off on server
    } else {
      // TODO Request user to turn on camera
    }
    participant.cameraOn = !participant.cameraOn;
  }
  function toggleMic(participant: MeetingParticipant) {
    assert(userIsModerator, "You are not a moderator");
    // See camera above
    participant.micOn = !participant.micOn;
  }
</script>

<style>
  .actions :global(button.plain) {
    border-radius: 0px;
  }
  .actions :global(button.disabled) {
    opacity: inherit;
  }
  .actions :global(button:hover:not(.disabled)) {
    background-color: #57BDB3;
  }
  :global(.person) .actions :global(svg) {
    stroke: black;
    stroke-width: 1px;
  }
  :global(.person.selected) .actions :global(svg) {
    stroke: white;
    stroke-width: 2px;
  }
  .actions :global(.svelteui-ActionIcon-root) {
    color: white;
    background-color: transparent;
  }
  .more-actions :global(.svelteui-ActionIcon-root:hover) {
    background-color: rgba(32, 174, 158, 50%); /* #20AE9E */
  }
</style>
