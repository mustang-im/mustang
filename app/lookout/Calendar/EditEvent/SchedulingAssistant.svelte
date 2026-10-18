<vbox flex class="scheduling-assistant">
  <hbox class="header">
    <SendButton label={sendLabel} disabled={sendDisabled} onClick={onSend} />
    <grid class="fields">
      <TimeBox {event} editor={timeEditor} {flow} showSummary={false} />
    </grid>
  </hbox>
  <AvailabilityGrid {event} {timeEditor} />
</vbox>

<script lang="ts">
  import type { Event } from "../../../logic/Calendar/Event";
  import type { EventEditFlow } from "./EventEditFlow";
  import type { EventTimeEditor } from "./EventTimeEditor";
  import SendButton from "./SendButton.svelte";
  import TimeBox from "./TimeBox.svelte";
  import AvailabilityGrid from "./AvailabilityGrid.svelte";

  export let event: Event;
  export let flow: EventEditFlow;
  export let timeEditor: EventTimeEditor;
  export let sendLabel: string;
  export let sendDisabled: string | false = false;
  export let onSend: () => Promise<void>;
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
