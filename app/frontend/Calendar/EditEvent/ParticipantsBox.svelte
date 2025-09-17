<SectionTitle label={$t`Invite`}>
  <!--
  <hbox flex />
  <hbox class="buttons">
    <RoundButton
        label={$t`Expand dialog size to full window`}
        icon={OptionalParticipantsIcon}
        onClick={onOptionalParticipants}
        classes="plain"
        border={false}
        iconSize="16px"
        />
  </hbox>
  -->
</SectionTitle>
<vbox class="participants">
  <PersonsAutocomplete persons={event.participants} placeholder={$t`Add participants`} {onAddPerson}>
    <hbox slot="person-pill-before-avatar" let:person={participant}>
      <ParticipantConfirmIcon {participant} />
    </hbox>
    <hbox slot="person-popup-bottom" let:person={participant}>
      <ParticipantConfirmText {participant} />
    </hbox>
    <hbox slot="result-bottom-row" let:person>
      <PersonAvailability {person} />
    </hbox>
  </PersonsAutocomplete>
</vbox>

<vbox class="availability-grid">
  <ExpandSection>
    <hbox slot="header" class="header">{$t`Availability of participants`}</hbox>
    <AvailabilityGrid
      participants={event.participants}
      start={$event.startTime}
      calendar={$event.calendar}
      />
  </ExpandSection>
</vbox>

<script lang="ts">
  import type { PersonUID } from "../../../logic/Abstract/PersonUID";
  import type { Event } from "../../../logic/Calendar/Event";
  import { Participant } from "../../../logic/Calendar/Participant";
  import { InvitationResponse } from "../../../logic/Calendar/Invitation/InvitationStatus";
  import PersonsAutocomplete from "../../Contacts/PersonAutocomplete/PersonsAutocomplete.svelte";
  import PersonAvailability from "./PersonAvailability.svelte";
  import ParticipantConfirmIcon from "./ParticipantConfirmIcon.svelte";
  import ParticipantConfirmText from "./ParticipantConfirmText.svelte";
  import ExpandSection from "../../Shared/ExpandSection.svelte";
  import AvailabilityGrid from "./AvailabilityGrid.svelte";
  import SectionTitle from "./SectionTitle.svelte";
  // import OptionalParticipantsIcon from "lucide-svelte/icons/circle-dashed";
  import { t } from "../../../l10n/l10n";

  export let event: Event;

  function onAddPerson(person: PersonUID) {
    let participant = new Participant(person.emailAddress, person.name, InvitationResponse.Unknown);
    event.participants.add(participant);
  }
</script>

<style>
  /*.buttons {
    align-items: center;
    padding: 8px;
  }*/
  .participants :global(.participant-status-icon) {
    margin-inline-start: -4px;
    margin-inline-end: 6px;
  }
  .participants :global(.person:has(.declined) .name) {
    text-decoration: line-through;
  }
  .availability-grid {
    max-height: 350px;
    max-width: 400px;
    margin-block-start: 18px;
  }
  .availability-grid .header {
    opacity: 50%;
  }
</style>
