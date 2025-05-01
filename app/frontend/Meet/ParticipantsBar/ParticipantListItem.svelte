<hbox class="actions">
  {#if participant instanceof MeetingParticipant}
    {#if participant.joined}
      {#if $participant.screenSharing}
        <Button plain
          classes="screen-sharing"
          icon={ScreenSharingIcon}
          disabled={true}
          iconOnly />
      {/if}
      {#if $participant.handUp}
        <Button plain
          classes={$participant.handUp ? "hand-up" : "hand-down"}
          label={$participant.handUp ? $t`Take hand down` : ""}
          onClick={() => toggleHand(participant)}
          icon={$participant.handUp ? HandIcon : HandDownIcon}
          disabled={!userIsModerator}
          iconOnly />
      {/if}
      <hbox class="more-actions" class:speaking={$participant.isSpeaking}>
        <Button plain
          classes="toggle-mic"
          label={$t`Mute`}
          onClick={() => toggleMic(participant)}
          icon={$participant.micOn ? MicrophoneIcon : MicrophoneOffIcon}
          disabled={!userIsModerator}
          iconOnly />
        <Button plain
          classes="toggle-camera"
          label={$t`Camera`}
          onClick={() => toggleCamera(participant)}
          icon={$participant.cameraOn ? CameraIcon : CameraOffIcon}
          disabled={!userIsModerator}
          iconOnly />
        <ButtonMenu>
          <MenuItem
            onClick={() => startPrivateChat(participant)}
            label={$t`Private chat`}
            tooltip={$t`Start a chat with only this person`}
            icon={ChatIcon} />
        </ButtonMenu>
      </hbox>
    {:else}
      <Button plain
        classes="not-joined"
        label={$t`Not in meeting`}
        icon={UserIcon}
        disabled={true}
        iconOnly />
    {/if}
  {/if}
</hbox>

<script lang="ts">
  import { MeetingParticipant } from "../../../logic/Meet/Participant";
  import Button from "../../Shared/Button.svelte";
  import ButtonMenu from "../../Shared/Menu/ButtonMenu.svelte";
  import MenuItem from "../../Shared/Menu/MenuItem.svelte";
  import HandIcon from '../../asset/icon/meet/hand.svg?raw';
  import HandDownIcon from "lucide-svelte/icons/grab";
  import CameraIcon from "lucide-svelte/icons/video";
  import CameraOffIcon from "lucide-svelte/icons/video-off";
  import MicrophoneIcon from "lucide-svelte/icons/mic";
  import MicrophoneOffIcon from "lucide-svelte/icons/mic-off";
  import ChatIcon from "lucide-svelte/icons/message-square";
  import UserIcon from "lucide-svelte/icons/user-round";
  import ScreenSharingIcon from "lucide-svelte/icons/monitor";
  import { assert, NotImplemented } from "../../../logic/util/util";
  import { t } from "../../../l10n/l10n";

  export let participant: MeetingParticipant;
  export let userIsModerator = false;

  function startPrivateChat(participant: MeetingParticipant) {
    throw new NotImplemented();
  }

  /////////////
  // Moderator functions

  function toggleHand(participant: MeetingParticipant) {
    assert(userIsModerator, $t`You are not a moderator`);
    if (!participant.handUp) {
      return;
    }
    // TODO send to server
    participant.handUp = false;
  }
  function toggleCamera(participant: MeetingParticipant) {
    assert(userIsModerator, $t`You are not a moderator`);
    // TODO Turn camera off on server
    participant.cameraOn = !participant.cameraOn;
  }
  function toggleMic(participant: MeetingParticipant) {
    assert(userIsModerator, $t`You are not a moderator`);
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
    stroke: white;
    stroke-width: 1.5px;
  }
  :global(.person.selected) .actions :global(svg) {
    stroke: white;
    stroke-width: 2px;
  }
  .actions :global(.svelteui-ActionIcon-root) {
    color: white;
    background-color: transparent;
  }
  .actions :global(.svelteui-ActionIcon-root svg) {
    stroke-width: 1px;
  }
  .actions :global(.not-joined svg) {
    stroke-opacity: 75%;
    stroke-dasharray: 2;
    stroke-width: 1.5px !important;
  }
  .speaking :global(.toggle-mic svg path:first-of-type) {
    fill: white;
  }
  .more-actions :global(.svelteui-ActionIcon-root:hover) {
    background-color: rgba(32, 174, 158, 50%); /* #20AE9E */
  }
</style>
