<vbox flex class="event-edit-window">
  <DialogHeader bind:event />
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
            <RepeatBox {event} bind:this={repeatBox} />
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
      <vbox class="column2 description" flex>
        {#if showDescription}
          <Section label={$t`Description`} icon={DescriptionIcon} flex>
            <DescriptionBox {event} />
          </Section>
        {/if}
      </vbox>
    </vbox>
  </Scroll>
</vbox>

<script lang="ts">
  import type { Event } from "../../../logic/Calendar/Event";
  import { Frequency } from "../../../logic/Calendar/RecurrenceRule";
  import { InvitationResponse } from "../../../logic/Calendar/Invitation/InvitationStatus";
  import TitleBox from "./TitleBox.svelte";
  import TimeBox from "./TimeBox.svelte";
  import RepeatBox from './RepeatBox.svelte';
  import ReminderBox from './ReminderBox.svelte';
  import ParticipantsBox from './ParticipantsBox.svelte';
  import LocationBox from './LocationBox.svelte';
  import OnlineMeetingBox from './OnlineMeetingBox.svelte';
  import DescriptionBox from './DescriptionBox.svelte';
  import Section from "./Section.svelte";
  import SectionTitle from "./SectionTitle.svelte";
  import DialogHeader from "./DialogHeader.svelte";
  import ExpanderButtons from "../../Shared/ExpanderButtons.svelte";
  import ExpanderButton from "../../Shared/ExpanderButton.svelte";
  import Scroll from "../../Shared/Scroll.svelte";
  import RepeatIcon from "lucide-svelte/icons/repeat-2";
  import ReminderIcon from "lucide-svelte/icons/bell";
  import ParticipantsIcon from "lucide-svelte/icons/users-round";
  import OnlineMeetingIcon from "lucide-svelte/icons/video";
  import LocationIcon from "lucide-svelte/icons/map-pin";
  import DescriptionIcon from "lucide-svelte/icons/notebook-pen";
  import { t } from "../../../l10n/l10n";

  export let event: Event;

  $: showRepeat = !!event.recurrenceRule || event.parentEvent && event.isNew;
  $: showReminder = !!$event.alarm;
  $: showParticipants = $event.participants.hasItems;
  $: showLocation = !!$event.location;
  $: showOnlineMeeting = $event.isOnline;
  $: showDescription = !!$event.descriptionHTML;

  let repeatBox: RepeatBox;

  function expandRepeat(): void {
    event.newRecurrenceRule(Frequency.Weekly);
  }

  const kDefaultReminderMins = 5;
  function expandReminder(): void {
    event.alarm = new Date(event.startTime.getTime() - kDefaultReminderMins * 60 * 1000);
  }

  function expandParticipants(): void {
    if (event.myParticipation == InvitationResponse.Organizer) {
      return;
    }
    event.createMeeting();
  }

  function expandLocation(): void {
    event.location = " ";
  }

  function expandOnlineMeeting(): void {
    event.isOnline = true;
    expandParticipants();
  }

  function expandDescription(): void {
    event.descriptionHTML = " ";
  }
</script>

<style>
  .event-edit-window {
    container-type: inline-size;
  }
  .columns {
    padding: 12px 16px 4px 16px;
  }
  .description :global(.section > .icon) {
    display: none;
  }
  @container (min-width: 1000px) {
    .columns.show-description {
      flex-direction: row;
    }
    .column2 {
      margin-block-start: -8px;
      margin-inline-start: 24px;
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
  :global(.inline) {
    display: inline-flex !important;
  }
</style>
