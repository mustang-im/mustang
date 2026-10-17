{#if look.isOnlineMeeting && !look.canJoin($now)}
  <span class="icon" title={$t`Online meeting`}>
    <OnlineMeetingIcon size="12" />
  </span>
{/if}
{#if look.isRecurring}
  <span class="icon" title={$t`Recurring event`}>
    <RecurringIcon size="12" />
  </span>
{:else if look.isException}
  <span class="icon exception" title={$t`Changed occurrence of a recurring event`}>
    <RecurringIcon size="12" />
  </span>
{/if}

<script lang="ts">
  import type { EventLook } from "../Event/EventLook";
  import { now } from "../selected";
  import RecurringIcon from "lucide-svelte/icons/repeat";
  import OnlineMeetingIcon from "lucide-svelte/icons/video";
  import { t } from "../../../l10n/l10n";

  export let look: EventLook;
</script>

<style>
  .icon {
    position: relative;
    display: flex;
    flex: none;
    align-items: center;
  }
  .exception::after {
    content: "";
    position: absolute;
    left: 50%;
    top: -2px;
    bottom: -2px;
    width: 1.5px;
    background-color: currentColor;
    transform: rotate(-45deg);
  }
</style>
