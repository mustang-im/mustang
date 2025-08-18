<hbox class="actions">
  <Button plain
    classes="not-joined"
    label={$t`Not in meeting`}
    icon={UserIcon}
    disabled={true}
    iconOnly />
</hbox>

<script lang="ts">
  import { MeetingParticipant } from "../../../logic/Meet/Participant";
  import Button from "../../Shared/Button.svelte";
  import UserIcon from "lucide-svelte/icons/user-round";
  import { t } from "../../../l10n/l10n";

  export let participant: MeetingParticipant;
  export let userIsModerator = false;
</script>

<style>
  .actions :global(button.plain) {
    border-radius: 0px;
  }
  .actions :global(.not-joined svg) {
    stroke: white;
    stroke-opacity: 75%;
    stroke-dasharray: 2;
    stroke-width: 1.5px;
  }
</style>
