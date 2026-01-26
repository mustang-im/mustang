<hbox class="event-proposal font-small" flex
  on:click
  on:dblclick
  {title}>
  <hbox class="time">{startTime}</hbox>
  {#if title}
    <hbox class="title">{title}</hbox>
  {/if}
  <hbox flex />
  <vbox class="toolbar">
    <Toolbar border>
      <slot name="buttons" />
    </Toolbar>
  </vbox>
</hbox>

<script lang="ts">
  import { getDateTimeFormatPref } from "../../../l10n/l10n";
  import Toolbar from "../../Shared/Toolbar/Toolbar.svelte";

  export let start: Date;
  export let end: Date;
  export let title: string | null = null;

  $: startTime = start.toLocaleString(getDateTimeFormatPref(), { hour: "numeric", minute: "2-digit" });
</script>

<style>
  .event-proposal {
    height: calc(100% - 4px); /** minus margin for drop shadow */
    width: calc(100% - 4px);
    position: absolute;
    overflow: hidden;
    flex-wrap: wrap;

    margin: 1px 2px 1px 2px; /** for drop shadow */
    box-shadow: 1px 0px 3px 0px rgba(0, 0, 0, 30%);
    border-radius: 5px;
  }
  .time {
    font-weight: 600;
    white-space: nowrap;
  }
  .time,
  .title {
    margin-inline-start: 6px;
    margin-block-start: 5px;
  }

  .toolbar {
    margin: 8px;
  }
  .event-proposal :global(button .label) {
    white-space: nowrap;
  }
</style>
