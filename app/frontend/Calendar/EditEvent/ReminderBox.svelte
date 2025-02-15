<hbox title={$t`Reminder`} flex>
  <input class="duration" type="number" bind:value={durationInUnit} on:input={durationUnit.onDurationChanged} min={0} />
  <DurationUnit bind:durationInSeconds={beforeInSec} bind:durationInUnit bind:this={durationUnit} on:change={onChanged} />
  {#if $event.alarm}
    <hbox class="label suffix">{$t`before, at`}</hbox>
    <hbox class="label time">{$event.alarm.toLocaleTimeString(getUILocale(), { hour: "numeric", minute: "numeric" })}</hbox>
    <!--<TimeInput bind:time={$event.alarm} />-->
  {/if}
  <Button
    label={$t`Remove`}
    icon={XIcon}
    iconSize="16px"
    iconOnly
    plain
    on:click={onRemove}
    />
</hbox>

<script lang="ts">
  import type { Event } from "../../../logic/Calendar/Event";
  import DurationUnit from "./DurationUnit.svelte";
  import Button from "../../Shared/Button.svelte";
  import XIcon from "lucide-svelte/icons/x";
  import { getUILocale, t } from "../../../l10n/l10n";

  export let event: Event;

  let durationUnit: DurationUnit;
  let durationInUnit: number;
  $: beforeInSec = $event.alarm ? ($event.startTime.getTime() - $event.alarm.getTime()) / 1000 : 0;

  function onChanged(ev: CustomEvent<number>) {
    let seconds = ev.detail;
    if (!event.alarm) {
      event.alarm = new Date();
    }
    event.alarm.setTime(event.startTime.getTime() - seconds * 1000);
    event.notifyObservers();
  }

  function onRemove() {
    event.alarm = null;
  }
</script>

<style>
  .duration {
    width: 4em;
    text-align: right;
  }
  .time {
    padding-inline-start: 4px;
    padding-inline-end: 6px;
  }
  .suffix {
    padding-inline-start: 6px;
  }
</style>
