<vbox class="invitation-display">
  <hbox class="title-row">
    <hbox class="title selectable">
      {#if event.title}
        {event.title}
      {/if}
    </hbox>
    <hbox flex />
    <AccountDropDown
      selectedAccount={calendar}
      accounts={appGlobal.calendars}
      filterByWorkspace={false}
      withIcon={true} withLabel={false}
      />
  </hbox>
  <vbox class="details-grid">
    <DetailsGrid {event} />
  </vbox>
</vbox>

<script lang="ts">
  import { Event } from "../../../logic/Calendar/Event";
  import { Calendar } from "../../../logic/Calendar/Calendar";
  import AccountDropDown from "../../Shared/AccountDropDown.svelte";
  import DetailsGrid from "./DetailsGrid.svelte";
  import { appGlobal } from "../../../logic/app";

  export let event: Event;
  export let calendar: Calendar = event?.calendar ?? appGlobal.calendars.first;
</script>

<style>
  .title {
    font-size: 20px;
    font-weight: bold;
  }
  .details-grid {
    margin: 20px 16px;
  }
</style>
