<vbox flex class="header">
  <Stack>
    <hbox class="title-background" style="--header-color: {$selectedCalendar.color}" />
    <hbox class="window-title-bar">
      <hbox class="buttons">
        {#if !isFullWindow}
          <RoundButton
            label={$t`Expand dialog size to full window`}
            icon={ExpandDialogIcon}
            onClick={onExpandToWindow}
            classes="plain"
            border={false}
            iconSize="16px"
            />
        {/if}
        {#if !event.isIncomingMeeting}
          <RoundButton
            label={$t`Delete Event`}
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
      <hbox class="account-selector">
        <AccountDropDown
          bind:selectedAccount={$selectedCalendar}
          accounts={appGlobal.calendars}
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
        {#if canSave}
          <RoundButton
            label={$t`Revert`}
            icon={RevertIcon}
            onClick={onCancel}
            classes="plain save-or-close"
            iconSize="16px"
            />
          <RoundButton
            label={$t`Save`}
            icon={SaveIcon}
            onClick={onSave}
            classes="plain save-or-close"
            filled={true}
            iconSize="16px"
            />
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
  import type { Event } from "../../../logic/Calendar/Event";
  import { Calendar } from "../../../logic/Calendar/Calendar";
  import { Account } from "../../../logic/Abstract/Account";
  import { EventEditMustangApp, calendarMustangApp } from "../CalendarMustangApp";
  import { InvitationResponse } from "../../../logic/Calendar/Invitation/InvitationStatus";
  import { selectedCalendar } from "../selected";
  import { appGlobal } from "../../../logic/app";
  import Stack from "../../Shared/Stack.svelte";
  import AccountDropDown from "../../Shared/AccountDropDown.svelte";
  import RoundButton from "../../Shared/RoundButton.svelte";
  import Button from "../../Shared/Button.svelte";
  import type RepeatBox from "./RepeatBox.svelte";
  import AccountIcon from "lucide-svelte/icons/user-round";
  import ExpandDialogIcon from "lucide-svelte/icons/chevrons-left";
  import ShrinkDialogIcon from "lucide-svelte/icons/chevrons-right";
  import DeleteIcon from "lucide-svelte/icons/trash-2";
  import SaveIcon from "lucide-svelte/icons/check";
  import CloseIcon from "lucide-svelte/icons/x";
  import RevertIcon from "lucide-svelte/icons/undo-2";
  import { catchErrors } from "../../Util/error";
  import { assert, NotImplemented } from "../../../logic/util/util";
  import { t } from "../../../l10n/l10n";

  export let event: Event;
  export let repeatBox: RepeatBox;

  let isFullWindow = false;

  $: event.startEditing(); // not `$event`
  $: canSave = event && $event.title && $event.startTime && $event.endTime &&
      event.startTime.getTime() <= event.endTime.getTime() && $event.hasChanged();
  $: oldTitle = event?.title || $t`Event`;

  function onCancel() {
    assert(event.unedited, "need unedited state");
    event.copyFrom(event.unedited);
    event.finishEditing();
    onClose();
  }

  async function onSave() {
    if (repeatBox && !repeatBox.confirmAndChangeRule()) {
      return;
    }
    await event.saveToServer();
    await event.save();
    if (!event.calendar.events.contains(event)) {
      event.calendar.events.add(event);
    }
    if (event.recurrenceRule) {
      event.fillRecurrences(new Date(Date.now() + 1e11));
    }
    onClose();
  }

  async function onDelete() {
    if (event.recurrenceRule) {
      if (!confirm($t`Are you sure you want to remove this unfortunate series of events?`)) {
        return;
      }
    }
    await event.deleteFromServer();
    await event.deleteIt();
    onClose();
  }

  function onChangeCalendar(newCalendar: Account) {
    console.log("new calendar", newCalendar?.name, "old", event?.calendar?.name);
    event.moveToCalendar(newCalendar as Calendar);
  }

  function onExpandToWindow() {
    isFullWindow = true;
    throw new NotImplemented("Cannot expand the dialog to full window yet");
  }

  function onShrink() {
    isFullWindow = false;
    throw new NotImplemented("Cannot shrink the dialog to side bar yet");
  }

  function onClose() {
    event.finishEditing();
    event.title ||= oldTitle;
    let me = calendarMustangApp.subApps.find(app => app instanceof EventEditMustangApp && app.mainWindowProperties.event == event);
    calendarMustangApp.subApps.remove(me);
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
  .window-title-bar .buttons :global(button) {
    color: white;
  }
  .window-title-bar .buttons :global(button.save-or-close) {
    border-color: white;
  }
  .window-title-bar .buttons :global(.save-or-close path) {
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
</style>
