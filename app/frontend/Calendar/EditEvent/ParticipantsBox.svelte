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
<PersonsAutocomplete persons={event.participants} placeholder={$t`Add participants`}>
  <hbox slot="person-popup-bottom" let:person>
    <PersonResponse {person} />
  </hbox>
  <hbox slot="result-bottom-row" let:person>
    <PersonAvailability {person} />
  </hbox>
</PersonsAutocomplete>

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
  import type { Event } from "../../../logic/Calendar/Event";
  import PersonsAutocomplete from "../../Contacts/PersonAutocomplete/PersonsAutocomplete.svelte";
  import PersonAvailability from "./PersonAvailability.svelte";
  import PersonResponse from "./PersonResponse.svelte";
  import ExpandSection from "../../Shared/ExpandSection.svelte";
  import AvailabilityGrid from "./AvailabilityGrid.svelte";
  import SectionTitle from "./SectionTitle.svelte";
  // import RoundButton from "../../Shared/RoundButton.svelte";
  // import OptionalParticipantsIcon from "lucide-svelte/icons/circle-dashed";
  import { t } from "../../../l10n/l10n";

  export let event: Event;
</script>

<style>
  /*.buttons {
    align-items: center;
    padding: 8px;
  }*/
  .availability-grid {
    max-height: 350px;
    max-width: 400px;
    margin-block-start: 18px;
  }
  .availability-grid .header {
    opacity: 50%;
  }
</style>
