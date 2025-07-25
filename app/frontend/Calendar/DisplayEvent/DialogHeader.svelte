<vbox flex class="header">
  <Stack>
    <hbox class="title-background" style="--header-color: {event.calendar?.color}" />
    <hbox class="window-title-bar" flex>
      <hbox class="buttons">
        {#if !isFullWindow}
          <RoundButton
            label={$t`Expand dialog size to full window`}
            icon={ExpandDialogIcon}
            onClick={onExpandToWindow}
            classes="plain expand"
            border={false}
            iconSize="16px"
            />
        {/if}
        {#if $event.recurrenceCase == RecurrenceCase.Instance}
          <ButtonMenu bind:isMenuOpen={isDeleteSeriesOpen}>
            <RoundButton
              slot="control"
              label={$t`Delete event`}
              icon={DeleteIcon}
              onClick={event => { isDeleteSeriesOpen = !isDeleteSeriesOpen; event.stopPropagation(); }}
              classes="plain delete"
              border={false}
              iconSize="16px"
              />

            {#if !event.isIncomingMeeting}
              <MenuItem
                label={$t`Delete only this instance`}
                onClick={onDelete}
                classes="font-normal" />
              {#if $event.seriesStatus == "middle"}
                <MenuItem
                  label={$t`Delete remainder of series`}
                  onClick={onDeleteRemainder}
                  classes="font-normal" />
              {/if}
            {/if}
            <MenuItem
              label={$t`Delete entire series`}
              onClick={onDeleteAll}
              classes="font-normal" />
          </ButtonMenu>
        {:else}
          <RoundButton
            label={$t`Delete event`}
            icon={DeleteIcon}
            onClick={onDelete}
            disabled={!event.dbID && !event.parentEvent}
            classes="plain delete"
            border={false}
            iconSize="16px"
            />
        {/if}
      </hbox>
      <hbox class="account-icon">
        <hbox class="account-icon-dummy">
          <Button icon={AccountIcon} />
        </hbox>
      </hbox>
      <hbox class="account-name">
        {event.calendar?.name}
      </hbox>
      <hbox flex class="spacer" />
      <hbox class="buttons">
        {#if isFullWindow}
          <RoundButton
            label={$t`Shrink dialog to sidebar`}
            icon={ShrinkDialogIcon}
            onClick={onShrink}
            classes="plain"
            border={false}
            iconSize="16px"
            />
        {/if}
        <RoundButton
          label={$t`Close`}
          icon={CloseIcon}
          onClick={onClose}
          classes="plain save-or-close"
          iconSize="16px"
          />
      </hbox>
    </hbox>
  </Stack>
</vbox>

<script lang="ts">
  import { RecurrenceCase, type Event } from "../../../logic/Calendar/Event";
  import { CalendarEventMustangApp, calendarMustangApp } from "../CalendarMustangApp";
  import { selectedEvent } from "../selected";
  import { openApp, selectedApp } from "../../AppsBar/selectedApp";
  import Stack from "../../Shared/Stack.svelte";
  import RoundButton from "../../Shared/RoundButton.svelte";
  import Button from "../../Shared/Button.svelte";
  import ButtonMenu from "../../Shared/Menu/ButtonMenu.svelte";
  import MenuItem from "../../Shared/Menu/MenuItem.svelte";
  import AccountIcon from "lucide-svelte/icons/user-round";
  import ExpandDialogIcon from "lucide-svelte/icons/chevrons-left";
  import ShrinkDialogIcon from "lucide-svelte/icons/chevrons-right";
  import DeleteIcon from "lucide-svelte/icons/trash-2";
  import CloseIcon from "lucide-svelte/icons/x";
  import { t } from "../../../l10n/l10n";

  export let event: Event;

  $: isFullWindow = $selectedApp instanceof CalendarEventMustangApp;
  let isDeleteSeriesOpen = false;

  // <copied from="../EditEvent/DialogHeader.svelte">
  async function onDelete() {
    if (event.seriesStatus == "only") {
      await event.parentEvent.deleteIt();
    } else {
      await event.deleteIt();
    }
    $selectedEvent = null;
    onClose();
  }

  async function onDeleteAll() {
    if (!confirm($t`Are you sure you want to remove this unfortunate series of events?`)) {
      return;
    }
    let master = event.parentEvent;
    await master.deleteIt();
    $selectedEvent = null;
    onClose();
  }

  async function onDeleteRemainder() {
    event.parentEvent.cancelEditing();
    event.cancelEditing();
    await event.truncateRecurrence(event.startTime);
    $selectedEvent = null;
    onClose();
  }

  function onClose() {
    let me = calendarMustangApp.subApps.find(app => app instanceof CalendarEventMustangApp && app.mainWindowProperties.event == event);
    calendarMustangApp.subApps.remove(me);
    if (!isFullWindow) {
      // Make sidebar disappear, see CalendarApp.svelte
      $selectedEvent = null;
    }
  }

  function onExpandToWindow() {
    calendarMustangApp.showEvent(event);
  }

  function onShrink() {
    $selectedEvent = event;
    openApp(calendarMustangApp);
  }
  // </copied>
</script>

<style>
  .header {
    height: 48px;
    color: white;
    margin-block-end: 8px;
    flex: none;
  }
  .title-background {
    background: var(--header-color);
    /* background image, in the account color
    background:
      linear-gradient(var(--header-color), var(--header-color)),
      linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)),
      url("../../asset/header-background.jpeg");
    background-blend-mode: multiply;
    background-repeat: repeat-x; */
  }
  /*  background-image: url("../../asset/header-background.jpeg");*/
  .buttons :global(button) {
    color: white;
  }
  .buttons :global(button.save-or-close) {
    border-color: white;
  }
  .buttons :global(.save-or-close path) {
    stroke-width: 3px;
  }

  .account-icon {
    margin-inline-start: 32px;
    margin-inline-end: 8px;
    align-self: end;
    position: relative;
    left: 0;
    top: 10px;
  }
  .account-name {
    margin-inline-start: 8px;
    margin-block-start: 18px; /** TODO align properly */
    margin-block-end: 4px;
  }
  .account-icon-dummy {
    height: 24px;
    width: 24px;
    align-items: center;
    justify-content: center;
  }
  .account-icon-dummy :global(button:not(.add-specificity)) {
    background-color: white;
  }
  @container (max-width: 400px) {
    .account-icon {
      display: none;
    }
    .account-selector {
      max-width: 50px;
    }
    .buttons :global(.expand) {
      margin-inline-start: -4px;
    }
  }
  .buttons {
    align-items: center;
    padding: 8px;
  }
  .buttons :global(button) {
    margin-inline-start: 8px;
  }
  .buttons :global(button.delete) {
    background-color: lightsalmon;
  }
  .buttons :global(.menu .menuitem),
  .buttons :global(.menu .label) {
    color: unset;
  }
</style>
