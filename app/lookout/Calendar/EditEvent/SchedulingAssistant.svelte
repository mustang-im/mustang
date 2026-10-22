<vbox flex class="scheduling-assistant">
  <hbox class="header">
    <SendButton label={sendLabel} disabled={sendDisabled} onClick={onSend} />
    <grid class="fields">
      <TimeBox {event} editor={timeEditor} {flow} showSummary={false} />
    </grid>
  </hbox>
  <hbox class="view-tabs">
    <DialogTabs tabs={viewTabs} bind:selected={view} />
  </hbox>
  {#if view == "free"}
    <vbox flex class="view">
      <FreeSlots {event} showHours={10} />
    </vbox>
  {:else if view == "participants"}
    <AvailabilityGrid {event} {timeEditor} />
  {:else}
    <vbox flex class="view">
      <AvailabilityPoll {event} bind:sml={poll}>
        <PollEdit slot="editor" let:sml {sml} showDuration={false} />
      </AvailabilityPoll>
    </vbox>
  {/if}
</vbox>

<script lang="ts">
  import type { Event } from "../../../logic/Calendar/Event";
  import type { SMLData } from "../../../logic/Mail/SML/SMLData";
  import type { EventEditFlow } from "./EventEditFlow";
  import type { EventTimeEditor } from "./EventTimeEditor";
  import SendButton from "./SendButton.svelte";
  import TimeBox from "./TimeBox.svelte";
  import AvailabilityGrid from "./AvailabilityGrid.svelte";
  import FreeSlots from "../../../frontend/Calendar/EditEvent/Availability/FreeSlots.svelte";
  import AvailabilityPoll from "../../../frontend/Calendar/EditEvent/Availability/AvailabilityPoll.svelte";
  import PollEdit from "../SML/Shared/PollEdit.svelte";
  import DialogTabs from "../../Shared/Dialog/DialogTabs.svelte";
  import { t } from "../../../l10n/l10n";

  export let event: Event;
  export let flow: EventEditFlow;
  export let timeEditor: EventTimeEditor;
  export let sendLabel: string;
  export let sendDisabled: string | false = false;
  export let onSend: () => Promise<void>;

  const viewTabs = [
    { id: "free", label: $t`Free times` },
    { id: "participants", label: $t`Who is free when` },
    { id: "poll", label: $t`Meeting time poll` },
  ];
  let view = "free";
  let poll: SMLData | null = null;
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
  .view-tabs {
    flex-shrink: 0;
    margin: 0 24px 8px 24px;
  }
  .view-tabs :global(.dialog-tabs) {
    flex: 1;
  }
  .view {
    min-height: 0;
    margin: 0 24px 12px 24px;
  }
</style>
