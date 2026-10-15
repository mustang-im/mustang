<vbox flex class="scheduling-assistant">
  <hbox class="header">
    <SendButton label={sendLabel} disabled={sendDisabled} onClick={onSend} />
    <grid class="fields">
      <TimeRows {event} editor={timeEditor} pattern={flow.pattern} showSummary={false} {onRecurrence} />
    </grid>
  </hbox>
  <FreeBusyGrid {event} {timeEditor} bind:this={grid} />
</vbox>

<script lang="ts">
  import type { Event } from "../../../logic/Calendar/Event";
  import type { EventEditFlow } from "../EditEvent/EventEditFlow";
  import type { EventTimeEditor } from "../EditEvent/EventTimeEditor";
  import SendButton from "../EditEvent/SendButton.svelte";
  import TimeRows from "../EditEvent/TimeRows.svelte";
  import FreeBusyGrid from "./FreeBusyGrid.svelte";

  export let event: Event;
  export let flow: EventEditFlow;
  export let timeEditor: EventTimeEditor;
  export let sendLabel: string;
  export let sendDisabled: string | false = false;
  export let onSend: () => Promise<void>;
  export let onRecurrence: () => void;

  let grid: FreeBusyGrid;

  export function refresh() {
    grid?.refresh();
  }

  export function focusAddAttendee() {
    grid?.focusAddAttendee();
  }
</script>

<style>
  .scheduling-assistant {
    min-height: 0;
  }
  .header {
    flex-shrink: 0;
    align-items: start;
    gap: 16px;
    padding: 12px 24px 12px 24px;
  }
  .fields {
    grid-template-columns: max-content 1fr;
    align-items: center;
    column-gap: 12px;
    row-gap: 8px;
  }
  .fields :global(.row-label) {
    min-width: 80px;
    text-align: end;
  }
</style>
