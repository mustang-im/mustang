<vbox flex class="header">
  <Stack>
    <hbox class="title-background" style="--header-color: {event.calendar?.color}" />
    <hbox class="window-title-bar" flex>
      <hbox class="buttons" flex>
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
  import type { Event } from "../../../logic/Calendar/Event";
  import { CalendarEventMustangApp, calendarMustangApp } from "../CalendarMustangApp";
  import { selectedEvent } from "../selected";
  import { openApp, selectedApp } from "../../AppsBar/selectedApp";
  import Stack from "../../Shared/Stack.svelte";
  import RoundButton from "../../Shared/RoundButton.svelte";
  import Button from "../../Shared/Button.svelte";
  import AccountIcon from "lucide-svelte/icons/user-round";
  import ExpandDialogIcon from "lucide-svelte/icons/chevrons-left";
  import ShrinkDialogIcon from "lucide-svelte/icons/chevrons-right";
  import CloseIcon from "lucide-svelte/icons/x";
  import { t } from "../../../l10n/l10n";

  export let event: Event;

  $: isFullWindow = $selectedApp instanceof CalendarEventMustangApp;

  function onExpandToWindow() {
    calendarMustangApp.showEvent(event);
  }

  function onShrink() {
    $selectedEvent = event;
    openApp(calendarMustangApp);
  }

  function onClose() {
    let me = calendarMustangApp.subApps.find(app => app instanceof CalendarEventMustangApp && app.mainWindowProperties.event == event);
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
    top: 18px;
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
