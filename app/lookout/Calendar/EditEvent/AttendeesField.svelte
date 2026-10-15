<hbox class="attendees-field" class:read-only={readOnly} bind:this={fieldEl}>
  <PersonsAutocomplete persons={attendees} {placeholder} {onAddPerson} {onRemovePerson}
    disabled={readOnly} {autofocus}>
    <hbox slot="person-pill-before-avatar" let:person>
      <ParticipantConfirmIcon participant={asParticipant(person)} />
    </hbox>
    <hbox slot="person-popup-bottom" let:person>
      <ParticipantConfirmText participant={asParticipant(person)} />
    </hbox>
  </PersonsAutocomplete>
</hbox>

<script lang="ts">
  import type { Event } from "../../../logic/Calendar/Event";
  import type { PersonUID } from "../../../logic/Abstract/PersonUID";
  import type { Participant } from "../../../logic/Calendar/Participant";
  import { InvitationResponse } from "../../../logic/Calendar/Invitation/InvitationStatus";
  import PersonsAutocomplete from "../../../frontend/Contacts/PersonAutocomplete/PersonsAutocomplete.svelte";
  import ParticipantConfirmIcon from "../../../frontend/Calendar/EditEvent/ParticipantConfirmIcon.svelte";
  import ParticipantConfirmText from "../../../frontend/Calendar/EditEvent/ParticipantConfirmText.svelte";
  import { EventEditFlow } from "./EventEditFlow";

  export let event: Event;
  export let readOnly = false;
  export let placeholder: string = null;
  export let autofocus = false;

  let fieldEl: HTMLElement;

  $: attendees = event.participants.filterObservable(participant => participant.response != InvitationResponse.Organizer);

  function onAddPerson(person: PersonUID) {
    EventEditFlow.addParticipant(event, person);
  }

  function onRemovePerson(person: PersonUID) {
    event.participants.remove(asParticipant(person));
  }

  function asParticipant(person: PersonUID): Participant {
    return person as Participant;
  }

  export function focus() {
    fieldEl?.querySelector("input")?.focus();
  }
</script>

<style>
  .attendees-field {
    flex: 1 1 0;
    min-width: 0;
  }
  .attendees-field :global(.persons-autocomplete) {
    border-block-end: none;
    padding: 0;
  }
  .attendees-field :global(.person-autocomplete input) {
    box-shadow: none;
    padding: 0 4px !important;
    background-color: transparent;
  }
  .attendees-field :global(.participant-status-icon) {
    margin-inline-start: -2px;
    margin-inline-end: 4px;
  }
  .attendees-field :global(.person:has(.declined) .name) {
    text-decoration: line-through;
  }
</style>
