<hbox class="availability font-smallest" class:yes={available} class:no={available === false}>
  {#if available }
    <span class="yes">{$t`Available`}</span>
  {:else if available === false }
    <span class="no">{$t`Not available`}</span>
  {:else}
    <span class="unknown">{$t`Unknown`}</span>
  {/if}
</hbox>

<script lang="ts">
  import type { Participant } from "../../../logic/Calendar/Participant";
  import { t } from "../../../l10n/l10n";

  export let person: Participant;

  let available: boolean = true;
</script>

<style>
  .availability {
    margin-block-start: -1px;
  }
  .availability.yes {
    color: green;
  }
  .availability:no {
    color: red;
  }
</style>
