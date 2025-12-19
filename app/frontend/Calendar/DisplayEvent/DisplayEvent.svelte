<vbox class="event-display" flex>
  <hbox class="title-row">
    <hbox class="title selectable font-normal">
      {event.title ?? ""}
    </hbox>
    <hbox flex />
    <hbox class="buttons">
      <RoundButton
        label={$t`Edit`}
        icon={EditIcon}
        onClick={onEdit}
        />
      <RoundButton
        label={$t`Close`}
        icon={CloseIcon}
        onClick={onClose}
        />
    </hbox>
  </hbox>
  <vbox class="details-grid">
    <DetailsGrid {event} />
  </vbox>
  {#if $event.hasDescription}
    <Paper>
      <WebView html={$event.descriptionHTML} title="" {headHTML} />
    </Paper>
  {/if}
</vbox>

<script lang="ts">
  import type { Event } from "../../../logic/Calendar/Event";
  import { selectedEvent } from "../selected";
  import { calendarMustangApp, CalendarEventMustangApp } from "../CalendarMustangApp";
  import { openApp } from "../../AppsBar/selectedApp";
  import cssContent from "../../Mail/Message/content.css?inline";
  import cssBody from "../../Mail/Message/content-body.css?inline";
  import DetailsGrid from "./DetailsGrid.svelte";
  import Paper from "../../Shared/Paper.svelte";
  import WebView from "../../Shared/WebView.svelte";
  import RoundButton from "../../Shared/RoundButton.svelte";
  import EditIcon from "lucide-svelte/icons/pencil";
  import CloseIcon from "lucide-svelte/icons/x";
  import { t } from "../../../l10n/l10n";

  export let event: Event;

  let headHTML = `<style>\n${cssBody}\n${cssContent}\n</style>`;

  function onEdit() {
    calendarMustangApp.showEvent(event); // open full screen
    event.startEditing();
  }

  function onClose() {
    // If event was sidebar only: Close event display, go back to default sidebar (e.g. tasks view)
    // If event was full screen: go back to calendar, and (ideally) keep the event in the sidebar as display-only
    $selectedEvent = null;
    let me = calendarMustangApp.subApps.find(app => app instanceof CalendarEventMustangApp && app.windowParams.event == event);
    calendarMustangApp.subApps.remove(me);
    openApp(calendarMustangApp, { event: event });
  }
</script>

<style>
  .event-display {
    margin-block-start: 12px;
  }
  .title-row {
    margin-inline: 16px;
  }
  .title {
    font-weight: bold;
    margin-inline-end: 8px;
  }
  .buttons {
    align-items: start;
    gap: 8px;
  }
  .details-grid {
    margin: 20px 16px;
  }
</style>
