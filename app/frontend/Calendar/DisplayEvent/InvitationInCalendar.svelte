<vbox class="show-event" flex>
  <DialogHeader {event} />
  <vbox class="content">
    <InvitationDisplay {event} selectedCalendar={event.calendar} {calendars} />

    {#if $event.isCancelled }
      <hbox class="cancelled-text">
        {$t`This meeting has been cancelled by the organizer. You may delete it.`}
      </hbox>
    {:else}
      <InvitationButtons invitation={event} myParticipation={$event.myParticipation} />
    {/if}
  </vbox>
  <vbox class="description" flex>
    <WebView html={$event.descriptionHTML} title="" {headHTML} />
  </vbox>
</vbox>

<script lang="ts">
  import type { Event } from "../../../logic/Calendar/Event";
  import InvitationDisplay from "./InvitationDisplay.svelte";
  import InvitationButtons from "./InvitationButtons.svelte";
  import DialogHeader from "./DialogHeader.svelte";
  import WebView from "../../Shared/WebView.svelte";
  import cssContent from "../../Mail/Message/content.css?inline";
  import cssBody from "../../Mail/Message/content-body.css?inline";
  import { ArrayColl } from "svelte-collections";
  import { t } from "../../../l10n/l10n";

  export let event: Event;

  $: calendars = new ArrayColl([event.calendar]);

  let headHTML = `<style>\n${cssBody}\n${cssContent}\n</style>`;
</script>

<style>
  .show-event {
    container-type: inline-size;
  }
  .content {
    padding: 24px 32px;
  }
  .cancelled-text {
    flex-wrap: wrap;
    background-color: rgba(255, 98, 0, 0.443);
    padding: 8px 12px;
    border-radius: 3px;
    margin: 8px;
  }
</style>
