<hbox class="response">
  {#if person.response == ResponseType.Decline }
    <span class="no">{$t`Declined`}</span>
  {:else if person.response == ResponseType.Accept }
    <span class="yes">{$t`Accepted`}</span>
  {:else if person.response == ResponseType.Tentative }
    <span class="yes">{$t`Tentatively available`}</span>
  {:else if person.response == ResponseType.Organizer }
    <span class="yes">{$t`Organizer`}</span>
  {:else}
    <span class="unknown">{$t`No response yet`}</span>
  {/if}
</hbox>

<script lang="ts">
  import type { Participant } from "../../../logic/Calendar/Participant";
  import { ResponseType } from "../../../logic/Calendar/Invitation";
  import { t } from "../../../l10n/l10n";

  export let person: Participant;
</script>

<style>
  .response {
    font-size: 12px;
    padding: 8px 16px;
    border-left: 1px sold var(--border);
  }
  .yes {
    color: green;
  }
  .no {
    color: red;
  }
  .unknown {
    color: rgb(113, 113, 52);
  }
</style>
