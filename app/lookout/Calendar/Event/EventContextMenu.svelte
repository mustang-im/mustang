<ContextMenu bind:this={contextMenu}>
  {#if event}
    <MenuItem label={$t`Open`} icon={OpenIcon} shortCutInfo="Enter"
      onClick={() => CalendarActions.open(event)} />
    {#if event.isIncomingMeeting && !event.isCancelled}
      <MenuDivider />
      <MenuItem label={$t`Accept`} icon={AcceptIcon}
        selected={event.myParticipation == InvitationResponse.Accept}
        onClick={() => CalendarActions.respond(event, InvitationResponse.Accept)} />
      <MenuItem label={$t`Tentative`} icon={TentativeIcon}
        selected={event.myParticipation == InvitationResponse.Tentative}
        onClick={() => CalendarActions.respond(event, InvitationResponse.Tentative)} />
      <MenuItem label={$t`Decline`} icon={DeclineIcon}
        selected={event.myParticipation == InvitationResponse.Decline}
        onClick={() => CalendarActions.respond(event, InvitationResponse.Decline)} />
    {/if}
    {#if !event.isCancelled}
      <MenuItem label={$t`Forward`} icon={ForwardIcon} shortCutInfo="Ctrl+F"
        onClick={() => CalendarActions.forward(event)} />
    {/if}
    <MenuDivider />
    {#if event.isCancelled}
      <MenuItem label={$t`Remove from Calendar`} icon={DeleteIcon}
        onClick={() => CalendarActions.deleteOccurrence(event)} />
    {:else if isRecurring && event.isOutgoingMeeting}
      <MenuItem label={$t`Cancel Occurrence`} icon={CancelIcon}
        onClick={() => CalendarActions.cancelMeeting(event)} />
      <MenuItem label={$t`Cancel Series`} icon={CancelIcon}
        onClick={() => CalendarActions.deleteSeries(event)} />
    {:else if isRecurring}
      {#if !event.isIncomingMeeting}
        <MenuItem label={$t`Delete Occurrence`} icon={DeleteIcon} shortCutInfo="Del"
          onClick={() => CalendarActions.deleteOccurrence(event)} />
        {#if event.seriesStatus == "middle"}
          <MenuItem label={$t`Delete This and Following`} icon={DeleteIcon}
            onClick={() => CalendarActions.deleteRemainder(event)} />
        {/if}
      {/if}
      <MenuItem label={$t`Delete Series`} icon={DeleteIcon}
        onClick={() => CalendarActions.deleteSeries(event)} />
    {:else if event.isOutgoingMeeting}
      <MenuItem label={$t`Cancel Meeting`} icon={CancelIcon}
        onClick={() => CalendarActions.cancelMeeting(event)} />
    {:else}
      <MenuItem label={$t`Delete`} icon={DeleteIcon} shortCutInfo="Del"
        onClick={() => CalendarActions.deleteOccurrence(event)} />
    {/if}
  {/if}
</ContextMenu>

<script lang="ts">
  import { RecurrenceCase, type Event } from "../../../logic/Calendar/Event";
  import { InvitationResponse } from "../../../logic/Calendar/Invitation/InvitationStatus";
  import { CalendarActions } from "../CalendarActions";
  import ContextMenu from "../../../frontend/Shared/Menu/ContextMenu.svelte";
  import MenuItem from "../../../frontend/Shared/Menu/MenuItem.svelte";
  import MenuDivider from "../../../frontend/Shared/Menu/MenuDivider.svelte";
  import OpenIcon from "lucide-svelte/icons/square-pen";
  import AcceptIcon from "lucide-svelte/icons/check";
  import TentativeIcon from "lucide-svelte/icons/circle-help";
  import DeclineIcon from "lucide-svelte/icons/x";
  import ForwardIcon from "lucide-svelte/icons/forward";
  import CancelIcon from "lucide-svelte/icons/calendar-x-2";
  import DeleteIcon from "lucide-svelte/icons/trash-2";
  import { t } from "../../../l10n/l10n";

  let contextMenu: ContextMenu;
  let event: Event | null = null;

  $: isRecurring = event?.recurrenceCase == RecurrenceCase.Instance || event?.recurrenceCase == RecurrenceCase.Exception;

  export function openFor(mouseEvent: MouseEvent, forEvent: Event) {
    event = forEvent;
    contextMenu.onContextMenu(mouseEvent);
  }
</script>
