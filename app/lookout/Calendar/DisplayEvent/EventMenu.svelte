<MenuItem label={$t`Open`} icon={OpenIcon} shortCutInfo="Enter"
  onClick={() => openEvent(event, true)} />
{#if event.isIncomingMeeting && !event.isCancelled}
  <MenuDivider />
  {#each responses as response}
    <SubMenu label={response.label} icon={response.icon}>
      <MenuItem label={$t`Send the Response Now`} icon={SendIcon}
        checked={event.myParticipation == response.value}
        onClick={() => event.respondToInvitation(response.value)} />
    </SubMenu>
  {/each}
{/if}
{#if !event.isCancelled}
  <MenuDivider />
  <MenuItem label={$t`Forward`} icon={ForwardIcon} shortCutInfo="Ctrl+F"
    onClick={async () => openComposer(await OutgoingInvitation.forwardEventByMail(event))} />
{/if}
<MenuDivider />
{#if event.isCancelled}
  <MenuItem label={$t`Remove from Calendar`} icon={DeleteIcon}
    onClick={() => CalendarActions.deleteOccurrence(event)} />
{:else if isRecurring && event.isOutgoingMeeting}
  <SubMenu label={$t`Cancel Meeting`} icon={CancelIcon}>
    <MenuItem label={$t`Cancel Occurrence`} icon={CancelIcon}
      onClick={() => CalendarActions.cancelMeeting(event)} />
    <MenuItem label={$t`Cancel Series`} icon={CancelIcon}
      onClick={() => CalendarActions.deleteSeries(event)} />
  </SubMenu>
{:else if isRecurring}
  <SubMenu label={$t`Delete`} icon={DeleteIcon}>
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
  </SubMenu>
{:else if event.isOutgoingMeeting}
  <MenuItem label={$t`Cancel Meeting`} icon={CancelIcon}
    onClick={() => CalendarActions.cancelMeeting(event)} />
{:else}
  <MenuItem label={$t`Delete`} icon={DeleteIcon} shortCutInfo="Del"
    onClick={() => CalendarActions.deleteOccurrence(event)} />
{/if}

<script lang="ts">
  import { RecurrenceCase, type Event } from "../../../logic/Calendar/Event";
  import { InvitationResponse, type InvitationResponseInMessage } from "../../../logic/Calendar/Invitation/InvitationStatus";
  import { CalendarActions } from "../CalendarActions";
  import { openEvent } from "../../../frontend/Calendar/open";
  import { openComposer } from "../../../frontend/Mail/open";
  import { OutgoingInvitation } from "../../../logic/Calendar/Invitation/OutgoingInvitation";
  import MenuItem from "../../Shared/Menu/MenuItem.svelte";
  import MenuDivider from "../../Shared/Menu/MenuDivider.svelte";
  import SubMenu from "../../Shared/Menu/SubMenu.svelte";
  import SendIcon from "lucide-svelte/icons/send";
  import OpenIcon from "lucide-svelte/icons/square-pen";
  import AcceptIcon from "lucide-svelte/icons/check";
  import TentativeIcon from "lucide-svelte/icons/circle-help";
  import DeclineIcon from "lucide-svelte/icons/x";
  import ForwardIcon from "lucide-svelte/icons/forward";
  import CancelIcon from "lucide-svelte/icons/calendar-x-2";
  import DeleteIcon from "lucide-svelte/icons/trash-2";
  import { t } from "../../../l10n/l10n";

  export let event: Event;

  $: responses = [
    { value: InvitationResponse.Accept, label: $t`Accept`, icon: AcceptIcon },
    { value: InvitationResponse.Tentative, label: $t`Tentative`, icon: TentativeIcon },
    { value: InvitationResponse.Decline, label: $t`Decline`, icon: DeclineIcon },
  ] as { value: InvitationResponseInMessage, label: string, icon: typeof AcceptIcon }[];
  $: isRecurring = event.recurrenceCase == RecurrenceCase.Instance || event.recurrenceCase == RecurrenceCase.Exception;
</script>
