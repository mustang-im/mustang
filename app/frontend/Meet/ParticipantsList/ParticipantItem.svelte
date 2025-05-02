<hbox class="participant" class:speaking={$participant.isSpeaking}>
  <hbox class="name">
    {participant?.name?.substring(0, 50) ?? ""}
  </hbox>
  {#if $participant.handUp}
    <Button plain
      classes={"hand-up"}
      label={$t`Hand up`}
      icon={HandIcon}
      iconOnly />
  {/if}
  <Button plain
    classes="toggle-mic"
    label={$t`Mute`}
    onClick={() => toggleMic(participant)}
    icon={$participant.micOn ? MicrophoneIcon : MicrophoneOffIcon}
    disabled={!userIsModerator}
    iconOnly />
</hbox>

<script lang="ts">
  import { MeetingParticipant } from "../../../logic/Meet/Participant";
  import Button from "../../Shared/Button.svelte";
  import HandIcon from "../../asset/icon/meet/hand.svg?raw";
  import MicrophoneIcon from "lucide-svelte/icons/mic";
  import MicrophoneOffIcon from "lucide-svelte/icons/mic-off";
  import { assert } from "../../../logic/util/util";
  import { t } from "../../../l10n/l10n";

  export let participant: MeetingParticipant;
  export let userIsModerator = false;

  function toggleMic(participant: MeetingParticipant) {
    assert(userIsModerator, $t`You are not a moderator`);
    participant.micOn = !participant.micOn;
  }
</script>

<style>
  .participant {
    max-height: 32px;
    max-width: 200px;
    background-color: #00000020;
    color: white;
    padding: 0px 2px 0px 8px;
    border-radius: 3px;
  }
  .name {
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .participant :global(button.plain) {
    color: #A0A0A0;
    border-radius: 0px;
  }
  .participant.speaking :global(button.plain) {
    color: white;
  }
  .speaking :global(.toggle-mic svg path:first-of-type) {
    fill: white;
  }
  .participant :global(button.disabled) {
    opacity: inherit;
  }
</style>
