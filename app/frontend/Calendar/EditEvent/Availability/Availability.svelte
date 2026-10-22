<vbox class="availability" class:expanded class:enlarged>
  <hbox class="header">
    <Clickable onClick={toggleExpanded}>
      <hbox class="title">{$t`Availability of participants`}</hbox>
    </Clickable>
    {#if expanded && $invitees.hasItems}
      <IslandSwitcher faint={false}>
        <Button
          tooltip={$t`Free slots`}
          icon={FreeTimesIcon}
          iconSize="16px"
          onClick={() => view = "free"}
          selected={view == "free"}
          >
          <hbox slot="label">
            <span class="long">{$t`Free slots`}</span>
            <span class="short">{$t`Free *=> Short for: Free slots, the times when the participants have no appointments`}</span>
          </hbox>
        </Button>
        <Button
          tooltip={$t`Who is free when`}
          icon={ParticipantsIcon}
          iconSize="16px"
          onClick={() => view = "participants"}
          selected={view == "participants"}
          >
          <hbox slot="label">
            <span class="long">{$t`Who is free when`}</span>
            <span class="short">{$t`Who *=> Short for: Who is free when`}</span>
          </hbox>
        </Button>
        <Button
          label={$t`Poll *=> Ask the participants by email which times suit them`}
          icon={PollIcon}
          iconSize="16px"
          onClick={() => view = "poll"}
          selected={view == "poll"}
          />
      </IslandSwitcher>
    {/if}
    <hbox flex />
    {#if expanded && $invitees.hasItems}
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
    {/if}
    <Button
      plain
      icon={expanded ? CollapseIcon : ExpandIcon}
      label={expanded ? $t`Collapse` : $t`Expand`}
      onClick={toggleExpanded}
      iconOnly
      iconSize="16px"
      />
  </hbox>
  {#if expanded}
    {#if $invitees.hasItems}
      <vbox class="view">
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
  import Clickable from "../../../Shared/Clickable.svelte";
  import FreeTimesIcon from "lucide-svelte/icons/calendar-check";
  import ParticipantsIcon from "lucide-svelte/icons/users";
  import PollIcon from "lucide-svelte/icons/calendar-clock";
  import EnlargeIcon from "lucide-svelte/icons/maximize-2";
  import ShrinkIcon from "lucide-svelte/icons/minimize-2";
  import ExpandIcon from "lucide-svelte/icons/chevron-down";
  import CollapseIcon from "lucide-svelte/icons/chevron-up";
  import { t } from "../../../../l10n/l10n";

  export let event: Event;
  /** Whether the availability is shown, or only its title
   * in/out */
  export let expanded = false;
  /** Whether the availability fills the dialog
   * in/out */
  export let enlarged = false;

  let view: "free" | "participants" | "poll" = "free";
  let poll: SMLData | null = null;

  $: participants = event.participants;
  $: invitees = participants.filterObservable(participant => participant.response != InvitationResponse.Organizer);
  $: showHours = enlarged ? 10 : 5;

  function toggleExpanded() {
    expanded = !expanded;
    if (!expanded) {
      enlarged = false;
    }
  }
</script>

<style>
  .availability {
    container-type: inline-size;
    container-name: availability;
  }
  .availability.enlarged {
    flex: 1 1 0;
    min-height: 0;
  }
  .header {
    align-items: center;
    gap: 12px;
  }
  .title {
    opacity: 50%;
    white-space: nowrap;
    cursor: pointer;
  }
  .short {
    display: none;
  }
  @container availability (max-width: 650px) {
    .expanded .title {
      display: none;
    }
  }
  @container availability (max-width: 450px) {
    .long {
      display: none;
    }
    .short {
      display: inline;
    }
  }
  .view {
    height: 300px;
    margin-block-start: 6px;
    padding: 8px;
    border: 1px dotted var(--border);
    border-radius: var(--border-radius);
  }
  .enlarged .view {
    flex: 1 1 0;
    height: auto;
    min-height: 0;
  }
  .hint {
    margin-block-start: 6px;
    opacity: 70%;
  }
</style>
