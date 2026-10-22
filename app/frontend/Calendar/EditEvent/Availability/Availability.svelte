<vbox class="availability" class:enlarged>
  {#if $invitees.hasItems}
    <hbox class="header">
      <IslandSwitcher>
        <Button
          label={$t`Free times`}
          icon={FreeTimesIcon}
          iconSize="16px"
          onClick={() => view = "free"}
          selected={view == "free"}
          />
        <Button
          label={$t`Who is free when`}
          icon={ParticipantsIcon}
          iconSize="16px"
          onClick={() => view = "participants"}
          selected={view == "participants"}
          />
        <Button
          label={$t`Meeting time poll`}
          icon={PollIcon}
          iconSize="16px"
          onClick={() => view = "poll"}
          selected={view == "poll"}
          />
      </IslandSwitcher>
      <hbox flex />
      <RoundButton
        label={enlarged
          ? $t`Shrink *=> Make the availability small again, and show the other fields of the event`
          : $t`Enlarge *=> Let the availability fill the dialog`}
        icon={enlarged ? ShrinkIcon : EnlargeIcon}
        onClick={() => enlarged = !enlarged}
        classes="plain"
        border={false}
        iconSize="16px"
        />
    </hbox>
    <vbox class="view" flex>
      {#if view == "free"}
        <FreeSlots {event} {showHours} />
      {:else if view == "participants"}
        <ParticipantsDayView {event} {showHours} />
      {:else}
        <AvailabilityPoll {event} bind:sml={poll} />
      {/if}
    </vbox>
  {:else}
    <hbox class="hint">{$t`Add some participants`}</hbox>
  {/if}
</vbox>

<script lang="ts">
  import type { Event } from "../../../../logic/Calendar/Event";
  import { InvitationResponse } from "../../../../logic/Calendar/Invitation/InvitationStatus";
  import type { SMLData } from "../../../../logic/Mail/SML/SMLData";
  import FreeSlots from "./FreeSlots.svelte";
  import ParticipantsDayView from "./ParticipantsDayView.svelte";
  import AvailabilityPoll from "./AvailabilityPoll.svelte";
  import IslandSwitcher from "../../../Shared/IslandSwitcher.svelte";
  import Button from "../../../Shared/Button.svelte";
  import RoundButton from "../../../Shared/RoundButton.svelte";
  import FreeTimesIcon from "lucide-svelte/icons/calendar-check";
  import ParticipantsIcon from "lucide-svelte/icons/users";
  import PollIcon from "lucide-svelte/icons/calendar-clock";
  import EnlargeIcon from "lucide-svelte/icons/maximize-2";
  import ShrinkIcon from "lucide-svelte/icons/minimize-2";
  import { t } from "../../../../l10n/l10n";

  export let event: Event;
  /** Whether the availability fills the dialog
   * in/out */
  export let enlarged = false;

  let view: "free" | "participants" | "poll" = "free";
  let poll: SMLData | null = null;

  $: participants = event.participants;
  $: invitees = participants.filterObservable(participant => participant.response != InvitationResponse.Organizer);
  $: showHours = enlarged ? 10 : 5;
</script>

<style>
  .availability {
    height: 320px;
    margin-block-start: 4px;
    padding: 8px;
    border: 1px dotted var(--border);
    border-radius: var(--border-radius);
    container-type: inline-size;
    container-name: availability;
  }
  .availability.enlarged {
    height: auto;
    flex: 1 1 0;
    min-height: 0;
  }
  .header {
    align-items: center;
    margin-block-end: 8px;
  }
  @container availability (max-width: 500px) {
    .header :global(.button .label),
    .header :global(.button .gap) {
      display: none;
    }
  }
  .view {
    min-height: 0;
  }
  .hint {
    opacity: 70%;
  }
</style>
