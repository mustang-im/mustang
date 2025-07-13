<vbox class="invitation-display" class:cancelled={$event.isCancelled}>
  <hbox class="title-row">
    <hbox class="title selectable">
      {event.title ?? ""}
    </hbox>
    <hbox flex />
    {#if calendars && calendars.length > 2}
      <AccountDropDown
        accounts={calendars}
        selectedAccount={selectedCalendar}
        on:select
        filterByWorkspace={false}
        icon={AccountIcon}
        withLabel={false}
        />
    {/if}
  </hbox>
  <vbox class="details-grid">
    <DetailsGrid {event} />
  </vbox>
</vbox>

<script lang="ts">
  import type { Calendar } from "../../../logic/Calendar/Calendar";
  import type { Event } from "../../../logic/Calendar/Event";
  import DetailsGrid from "./DetailsGrid.svelte";
  import AccountDropDown from "../../Shared/AccountDropDown.svelte";
  import AccountIcon from "lucide-svelte/icons/book-user";
  import type { Collection } from "svelte-collections";

  export let event: Event;
  export let calendars: Collection<Calendar>;
  /** in/out */
  export let selectedCalendar: Calendar | undefined;
</script>

<style>
  .title {
    font-size: 20px;
    font-weight: bold;
  }
  .cancelled .title {
    text-decoration: line-through;
  }
  .details-grid {
    margin: 20px 16px;
  }
</style>
