<ContextMenu bind:this={menu}>
  {#each $shownCalendars.each as calendar}
    <NewEventMenuItem {calendar} {startTime} />
  {/each}
</ContextMenu>

<script lang="ts">
  import { createNewEvent } from "./event";
  import { getCalendarSelection } from "./selected";
  import ContextMenu from "../Shared/Menu/ContextMenu.svelte";
  import NewEventMenuItem from "./NewEventMenuItem.svelte";
  import { AppWindow } from "../MainWindow/AppWindow";

  const { shownCalendars } = getCalendarSelection();
  const appWindow = AppWindow.current();

  let menu: ContextMenu;
  let startTime: Date;

  /** Lets the user pick the calendar for the new event.
   * With only one calendar, creates the event right away. */
  export function openMenu(mouseEvent: MouseEvent, newEventStartTime: Date) {
    startTime = newEventStartTime;
    if ($shownCalendars.length > 1) {
      menu.onContextMenu(mouseEvent);
    } else {
      createNewEvent($shownCalendars.first, startTime, appWindow);
    }
  }
</script>
