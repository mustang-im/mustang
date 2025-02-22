<!-- svelte-ignore a11y-click-events-have-key-events -->
<vbox flex class="event-edit-window">
  <hbox class="window-title-bar">
    <hbox class="buttons">
      {#if !isFullWindow}
        <RoundButton
          label={$t`Expand dialog size to full window`}
          icon={ExpandDialogIcon}
          onClick={onExpand}
          classes="plain"
          border={false}
          iconSize="16px"
          />
      {/if}
      {#if event.response == ResponseType.Unknown || event.response == ResponseType.Organizer}
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
        <Button icon={ParticipantsIcon} />
      </hbox>
    </hbox>
    <hbox class="account-selector">
      <AccountDropDown bind:selectedAccount={$selectedCalendar} accounts={appGlobal.calendars} />
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
          onClick={onClose}
          classes="plain save-or-close"
          iconSize="16px"
          />
      {/if}
    </hbox>
  </hbox>
  <Scroll>
    <vbox class="columns" flex class:show-description={showDescription}>
      <vbox class="column1">
        <TimeBox {event} />
        <Section label={$t`Title`}>
          <TitleBox {event} />
        </Section>
        <Section>
          <ExpanderButtons>
            <ExpanderButton bind:expanded={showRepeat} label={$t`Repeat`} icon={RepeatIcon} on:expand={expandRepeat} />
            <ExpanderButton bind:expanded={showReminder} label={$t`Reminder`} icon={ReminderIcon} on:expand={expandReminder} />
            <ExpanderButton bind:expanded={showParticipants} label={$t`Invite`} icon={ParticipantsIcon} on:expand={expandParticipants} />
            <ExpanderButton bind:expanded={showLocation} label={$t`Location`} icon={LocationIcon} on:expand={expandLocation} />
            <ExpanderButton bind:expanded={showOnlineMeeting} label={$t`Online meeting`} icon={OnlineMeetingIcon} on:expand={expandOnlineMeeting} />
            <ExpanderButton bind:expanded={showDescription} label={$t`Description`} icon={DescriptionIcon} on:expand={expandDescription} />
          </ExpanderButtons>
        </Section>
        {#if showRepeat}
          <Section label={$t`Repeat`} icon={RepeatIcon}>
            <RepeatBox {event} bind:this={repeatBox}/>
          </Section>
        {/if}
        {#if showReminder}
          <Section label={$t`Reminder`} icon={ReminderIcon}>
            <SectionTitle label={$t`Reminder`}>
              <ReminderBox {event} />
            </SectionTitle>
          </Section>
        {/if}
        {#if showParticipants}
          <Section label={$t`Invite`} icon={ParticipantsIcon}>
            <ParticipantsBox {event} />
          </Section>
        {/if}
        {#if showLocation}
          <Section label={$t`Location`} icon={LocationIcon}>
            <SectionTitle label={$t`Location`}>
              <LocationBox {event} />
            </SectionTitle>
          </Section>
        {/if}
        {#if showOnlineMeeting}
          <Section label={$t`Online meeting`} icon={OnlineMeetingIcon}>
            <SectionTitle label={$t`Online meeting`}>
              <OnlineMeetingBox {event} />
            </SectionTitle>
          </Section>
        {/if}
      </vbox>
      <vbox class="column2" flex>
        {#if showDescription}
          <Section label={$t`Description`} icon={DescriptionIcon} flex>
            <DescriptionBox {event} />
          </Section>
        {/if}
      </vbox>
    </vbox>
  </Scroll>
  {#if event.response != ResponseType.Unknown && event.response != ResponseType.Organizer}
    <hbox class="buttons">
      <InvitationResponseButtons {event} />
    </hbox>
  {/if}
</vbox>

<script lang="ts">
  import type { Event } from "../../../logic/Calendar/Event";
  import { EventEditMustangApp, calendarMustangApp } from "../CalendarMustangApp";
  import { ResponseType } from "../../../logic/Calendar/Invitation";
  import { selectedCalendar } from "../selected";
  import { appGlobal } from "../../../logic/app";
  import TitleBox from "./TitleBox.svelte";
  import TimeBox from "./TimeBox.svelte";
  import RepeatBox from './RepeatBox.svelte';
  import ReminderBox from './ReminderBox.svelte';
  import ParticipantsBox from './ParticipantsBox.svelte';
  import LocationBox from './LocationBox.svelte';
  import OnlineMeetingBox from './OnlineMeetingBox.svelte';
  import DescriptionBox from './DescriptionBox.svelte';
  import InvitationResponseButtons from "./InvitationResponseButtons.svelte";
  import Section from "./Section.svelte";
  import AccountDropDown from "../../Shared/AccountDropDown.svelte";
  import ExpanderButtons from "../../Shared/ExpanderButtons.svelte";
  import ExpanderButton from "../../Shared/ExpanderButton.svelte";
  import RoundButton from "../../Shared/RoundButton.svelte";
  import Button from "../../Shared/Button.svelte";
  import Scroll from "../../Shared/Scroll.svelte";
  import RepeatIcon from "lucide-svelte/icons/repeat-2";
  import ReminderIcon from "lucide-svelte/icons/bell";
  import ParticipantsIcon from "lucide-svelte/icons/user-round";
  import OnlineMeetingIcon from "lucide-svelte/icons/video";
  import LocationIcon from "lucide-svelte/icons/map-pin";
  import DescriptionIcon from "lucide-svelte/icons/notebook-pen";
  import ExpandDialogIcon from "lucide-svelte/icons/chevrons-left";
  import ShrinkDialogIcon from "lucide-svelte/icons/chevrons-right";
  import DeleteIcon from "lucide-svelte/icons/trash-2";
  import SaveIcon from "lucide-svelte/icons/check";
  import CloseIcon from "lucide-svelte/icons/x";
  import { NotImplemented } from "../../../logic/util/util";
  import { t } from "../../../l10n/l10n";
  import SectionTitle from "./SectionTitle.svelte";

  export let event: Event;

  let isFullWindow = false;
  $: showRepeat = $event.repeat;
  $: showReminder = !!$event.alarm;
  $: showParticipants = $event.participants.hasItems || $event.response == ResponseType.Organizer;
  $: showLocation = $event.location;
  $: showOnlineMeeting = $event.isOnline;
  $: showDescription = $event.descriptionHTML;

  let repeatBox: RepeatBox;
  $: canSave = event && $event.title && $event.startTime && $event.endTime &&
      event.startTime.getTime() <= event.endTime.getTime();
  $: oldTitle = event?.title || $t`Event`;

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

  function onExpand() {
    isFullWindow = true;
    throw new NotImplemented("Cannot expand the dialog to full window yet");
  }

  function onShrink() {
    isFullWindow = false;
    throw new NotImplemented("Cannot shrink the dialog to side bar yet");
  }

  function onClose() {
    event.title ||= oldTitle;
    let me = calendarMustangApp.subApps.find(app => app instanceof EventEditMustangApp && app.mainWindowProperties.event == event);
    calendarMustangApp.subApps.remove(me);
  }


  function expandRepeat(): void {
    event.repeat = true;
  }

  const kDefaultReminderMins = 5;
  function expandReminder(): void {
    event.alarm = new Date(event.startTime.getTime() - kDefaultReminderMins * 60 * 1000);
  }

  function expandParticipants(): void {
    event.response = ResponseType.Organizer;
  }

  function expandLocation(): void {
    event.location = " ";
  }

  function expandOnlineMeeting(): void {
    event.isOnline = true;
    event.onlineMeetingURL = $t`will be created`;
    expandParticipants();
  }

  function expandDescription(): void {
    event.descriptionHTML = " ";
  }
</script>

<style>
  .window-title-bar {
    height: 48px;
    background-color: burlywood;
    color: white;
    margin-block-end: 8px;
  }
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
  .columns {
    padding: 12px 16px 4px 16px;
  }
  @media screen and (min-width: 1000px) {
    .columns.show-description {
      flex-direction: row;
    }
    .column2 {
      margin-block-start: -8px;
      margin-inline-start: 24px;
    }
    .column2 :global(.section > .icon) {
      display: none;
    }
    /*.columns.show-description .column1 {
      order: 2;
    }
    .columns.show-description .column2 {
      order: 1;
      margin-inline-end: 24px;
    }*/
  }
  .event-edit-window :global(.svelteui-Checkbox-label) {
    padding-inline-start: 8px;
  }
  .buttons {
    align-items: center;
    padding: 8px;
  }
  .buttons :global(button.delete) {
    background-color: lightsalmon;
  }
  :global(.inline) {
    display: inline-flex !important;
  }
</style>
