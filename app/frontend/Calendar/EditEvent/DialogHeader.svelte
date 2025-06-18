<vbox flex class="header">
  <Stack>
    <hbox class="title-background" style="--header-color: {newCalendar.color}" />
    <hbox class="window-title-bar">
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
        {#if !event.isIncomingMeeting}
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
        {/if}
      </hbox>
      <hbox class="account-icon">
        <hbox class="account-icon-dummy">
          <Button icon={AccountIcon} />
        </hbox>
      </hbox>
      <hbox class="account-selector">
        <AccountDropDown
          selectedAccount={newCalendar}
          accounts={appGlobal.calendars}
          filterByWorkspace={false}
          on:select={(event) => catchErrors(() => onChangeCalendar(event.detail))} />
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
        {#if canSave || canSaveSeries}
          <RoundButton
            label={$t`Revert`}
            icon={RevertIcon}
            onClick={onCancel}
            classes="plain save-or-close"
            iconSize="16px"
            />
          {#if canSaveSeries}
            <ButtonMenu bind:isMenuOpen={isSaveSeriesOpen}>
              <RoundButton
                slot="control"
                label={$t`Save`}
                icon={SaveIcon}
                onClick={event => { isSaveSeriesOpen = !isSaveSeriesOpen; event.stopPropagation(); }}
                classes="plain save-or-close"
                filled={true}
                iconSize="16px"
                />

              {#if canSave}
                <MenuItem
                  label={$t`Change only this instance`}
                  onClick={onSave}
                  classes="font-normal" />
              {/if}
              {#if $event.seriesStatus == "middle"}
                <MenuItem
                  label={$t`Change remainder of series`}
                  onClick={onChangeRemainder}
                  classes="font-normal" />
              {/if}
              <MenuItem
                label={$t`Change entire series`}
                onClick={onChangeAll}
                classes="font-normal" />
            </ButtonMenu>
          {:else}
            <RoundButton
              label={$t`Save`}
              icon={SaveIcon}
              onClick={onSave}
              classes="plain save-or-close"
              filled={true}
              iconSize="16px"
              />
          {/if}
        {:else}
          <RoundButton
            label={$t`Cancel`}
            icon={CloseIcon}
            onClick={onCancel}
            classes="plain save-or-close"
            iconSize="16px"
            />
        {/if}
      </hbox>
    </hbox>
  </Stack>
</vbox>

<script lang="ts">
  import { type Event, RecurrenceCase } from "../../../logic/Calendar/Event";
  import { Calendar } from "../../../logic/Calendar/Calendar";
  import { Account } from "../../../logic/Abstract/Account";
  import { EventEditMustangApp, calendarMustangApp } from "../CalendarMustangApp";
  import { selectedEvent, selectedCalendar } from "../selected";
  import { openApp, selectedApp } from "../../AppsBar/selectedApp";
  import { appGlobal } from "../../../logic/app";
  import Stack from "../../Shared/Stack.svelte";
  import type RepeatBox from "./RepeatBox.svelte";
  import AccountDropDown from "../../Shared/AccountDropDown.svelte";
  import ButtonMenu from "../../Shared/Menu/ButtonMenu.svelte";
  import RoundButton from "../../Shared/RoundButton.svelte";
  import Button from "../../Shared/Button.svelte";
  import MenuItem from "../../Shared/Menu/MenuItem.svelte";
  import AccountIcon from "lucide-svelte/icons/user-round";
  import ExpandDialogIcon from "lucide-svelte/icons/chevrons-left";
  import ShrinkDialogIcon from "lucide-svelte/icons/chevrons-right";
  import DeleteIcon from "lucide-svelte/icons/trash-2";
  import SaveIcon from "lucide-svelte/icons/check";
  import CloseIcon from "lucide-svelte/icons/x";
  import RevertIcon from "lucide-svelte/icons/undo-2";
  import { catchErrors } from "../../Util/error";
  import { assert } from "../../../logic/util/util";
  import { t } from "../../../l10n/l10n";

  export let event: Event;
  export let repeatBox: RepeatBox;

  $: event.startEditing(); // not `$event`
  $: newCalendar = event.calendar; // not `$event`
  $: hasMinimalProps = event && $event.title && $event.startTime && $event.endTime &&
      event.startTime.getTime() <= event.endTime.getTime();
  $: canSaveSeries = hasMinimalProps && $event.recurrenceCase == RecurrenceCase.Instance;
  $: canSave = hasMinimalProps && (
    $event.hasChanged() ||
    repeatBox && !event.parentEvent || // Change single event into series
    newCalendar != event.calendar);
  $: isFullWindow = $selectedApp instanceof EventEditMustangApp;
  let isSaveSeriesOpen = false;
  let isDeleteSeriesOpen = false;

  function confirmAndChangeRecurrenceRule(): boolean {
    let master = event.parentEvent || event;
    if (!repeatBox) {
      if (!master.recurrenceRule) {
        // Event had never been a recurring event.
        return true;
      }
      if (!confirm($t`Are you sure you want to remove this unfortunate series of events?`)) {
        return false;
      }
      master.recurrenceRule = null;
      master.recurrenceCase = RecurrenceCase.Normal;
    } else {
      let rule = repeatBox.newRecurrenceRule();
      if (master.recurrenceRule) {
        if (rule.isCompatible(master.recurrenceRule) && event.duration == master.duration) {
          return true;
        }
        if (!confirm($t`This change will remove all exceptions and exclusions for this series.`)) {
          return false;
        }
      }
      master.recurrenceRule = rule;
      master.recurrenceCase = RecurrenceCase.Master;
    }
    master.clearExceptions();
    return true;
  }

  function onCancel() {
    assert(event.unedited, "need unedited state");
    event.copyFrom(event.unedited);
    event.finishEditing();
    onClose();
  }

  async function onSave() {
    await saveEvent(event);
    onClose();
  }

  async function saveEvent(event: Event) {
    if (repeatBox) {
      // Turning a single event into a series. (The reverse is done in `onChangeAll()`.)
      event.recurrenceRule = repeatBox.newRecurrenceRule();
      event.recurrenceCase = RecurrenceCase.Master;
    }
    if (event.calendar != newCalendar && newCalendar) {
      // `moveToCalendar()` does the save and delete as well
      event = await event.moveToCalendar(newCalendar);
    } else {
      if (!event.calendar.events.contains(event)) {
        event.calendar.events.add(event);
      }
      await event.save();
    }
    if (event.recurrenceRule) {
      event.fillRecurrences();
    }
  }

  async function onChangeAll() {
    if (!confirmAndChangeRecurrenceRule()) {
      return;
    }
    let master = event.parentEvent;
    master.copyEditableFieldsFrom(event);
    await master.save();
    onClose();
  }

  async function onChangeRemainder() {
    let master = event.calendar.newEvent();
    master.copyEditableFieldsFrom(event);
    master.calUID = null;
    await saveEvent(master);
    await event.truncateRecurrence();
    onClose();
  }

  async function onDelete() {
    if (event.seriesStatus == "only") {
      await event.parentEvent.deleteIt();
    } else {
      await event.deleteIt();
    }
    onClose();
  }

  async function onDeleteAll() {
    if (!confirm($t`Are you sure you want to remove this unfortunate series of events?`)) {
      return;
    }
    let master = event.parentEvent;
    await master.deleteIt();
    onClose();
  }

  async function onDeleteRemainder() {
    await event.truncateRecurrence();
    onClose();
  }

  function onChangeCalendar(aCalendar: Account) {
    newCalendar = aCalendar as Calendar
    $selectedCalendar = newCalendar;
    // Will be applied during save
  }

  function onExpandToWindow() {
    calendarMustangApp.editEvent(event);
  }

  function onShrink() {
    $selectedEvent = event;
    openApp(calendarMustangApp);
  }

  function onClose() {
    event.finishEditing();
    let me = calendarMustangApp.subApps.find(app => app instanceof EventEditMustangApp && app.mainWindowProperties.event == event);
    calendarMustangApp.subApps.remove(me);
    if (!isFullWindow) {
      // Make sidebar disappear, see CalendarApp.svelte
      $selectedEvent = null;
    }
  }
</script>

<style>
  .header {
    height: 48px;
    color: white;
    margin-block-end: 8px;
    flex: none;
  }
  .title-background {
    background:
      linear-gradient(var(--header-color), var(--header-color)),
      linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)),
      url("../../asset/header-background.jpeg");
    background-blend-mode: multiply;
    background-repeat: repeat-x;
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
    top: 4px;
  }
  .account-selector {
    align-items: end;
    margin-block-end: 4px;
  }
  .account-icon-dummy {
    height: 24px;
    width: 24px;
    align-items: center;
    justify-content: center;
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
