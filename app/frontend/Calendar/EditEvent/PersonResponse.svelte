<hbox class="response">
  {#if person.response == ResponseType.Decline }
    <span class="no">{$t`Not available`}</span>
  {:else if person.response == ResponseType.Accept }
    <span class="yes">{$t`Available`}</span>
  {:else if person.response == ResponseType.Tentative }
    {$t`Tentatively available`}
  {:else if person.response == ResponseType.Organizer }
    {$t`Available`}
  {:else}
    {$t`No response received`}
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
</style>
