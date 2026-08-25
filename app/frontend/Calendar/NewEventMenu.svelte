<ContextMenu bind:this={menu}>
  {#each $calendars.each as calendar}
    <hbox class="menuitem" style="--calendar-color: {calendar.color}">
      <MenuItem
        icon={CalendarIcon}
        label={calendar.name}
        onClick={() => createNewEvent(calendar, startTime)}
        />
    </hbox>
  {/each}
</ContextMenu>

<script lang="ts">
  import { createNewEvent } from "./event";
  import { appGlobal } from "../../logic/app";
  import ContextMenu from "../Shared/Menu/ContextMenu.svelte";
  import MenuItem from "../Shared/Menu/MenuItem.svelte";
  import CalendarIcon from "lucide-svelte/icons/calendar";

  let menu: ContextMenu;
  let startTime: Date;
  $: calendars = appGlobal.calendars;

  /** Lets the user pick the calendar for the new event.
   * With only one calendar, creates the event right away. */
  export function openMenu(mouseEvent: MouseEvent, newEventStartTime: Date) {
    startTime = newEventStartTime;
    if ($calendars.length > 1) {
      menu.onContextMenu(mouseEvent);
    } else {
      createNewEvent($calendars.first, startTime);
    }
  }
</script>

<style>
  .menuitem :global(.menuitem .icon) {
    color: var(--calendar-color);
  }
</style>
