<vbox flex class="tracking">
  <hbox class="summary">
    <InfoIcon size={16} />
    <span>{summary}</span>
  </hbox>
  <vbox flex class="table-scroll">
    <table>
      <thead>
        <tr>
          <th>{$t`Name`}</th>
          <th>{$t`Attendance`}</th>
          <th>{$t`Response`}</th>
        </tr>
      </thead>
      <tbody>
        {#each $participants.each as participant (participant)}
          <tr>
            <td class="name">
              <ParticipantConfirmIcon {participant} />
              <span>{participant.name || participant.emailAddress}</span>
              {#if participant.name && participant.emailAddress}
                <span class="lo-secondary">{participant.emailAddress}</span>
              {/if}
            </td>
            <td>{EventFormInfo.attendanceLabel(participant)}</td>
            <td>{participant.response == InvitationResponse.Organizer ? "" : EventFormInfo.responseLabel(participant)}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </vbox>
</vbox>

<script lang="ts">
  import type { Event } from "../../../logic/Calendar/Event";
  import { InvitationResponse } from "../../../logic/Calendar/Invitation/InvitationStatus";
  import { EventFormInfo } from "./EventFormInfo";
  import ParticipantConfirmIcon from "../../../frontend/Calendar/EditEvent/ParticipantConfirmIcon.svelte";
  import InfoIcon from "lucide-svelte/icons/info";
  import { t } from "../../../l10n/l10n";

  export let event: Event;

  $: participants = event.participants;
  $: summary = $participants && EventFormInfo.responseSummary(event);
</script>

<style>
  .tracking {
    min-height: 0;
    padding: 12px 24px;
  }
  .summary {
    flex-shrink: 0;
    align-items: center;
    gap: 8px;
    margin-block-end: 12px;
    font-size: var(--lo-font-size-small);
  }
  .summary :global(svg) {
    color: var(--lo-accent-text);
  }
  .table-scroll {
    min-height: 0;
    overflow: auto;
    border: 1px solid var(--lo-border);
    border-radius: var(--lo-radius-small);
  }
  table {
    width: 100%;
    border-collapse: collapse;
  }
  th {
    position: sticky;
    top: 0;
    padding: 6px 12px;
    border-block-end: 1px solid var(--lo-border);
    background-color: var(--lo-pane-alt-bg);
    color: var(--lo-fg-secondary);
    font-weight: normal;
    text-align: start;
  }
  td {
    padding: 6px 12px;
    border-block-end: 1px solid var(--lo-divider);
  }
  td.name {
    display: flex;
    align-items: center;
    gap: 8px;
  }
</style>
