<hbox class="attendees-field" class:read-only={readOnly}>
  <MailAutocomplete addresses={recipients} label={$t`Required`} chips={$ribbonLayout.value == "simplified"}
    disabled={readOnly} {autofocus} bind:this={addressField} />
</hbox>

<script lang="ts">
  import type { Event } from "../../../logic/Calendar/Event";
  import type { PersonUID } from "../../../logic/Abstract/PersonUID";
  import type { RibbonLayout } from "../../Shared/Ribbon/RibbonGroup";
  import { InvitationResponse } from "../../../logic/Calendar/Invitation/InvitationStatus";
  import { EventEditFlow } from "./EventEditFlow";
  import { getLocalStorage } from "../../../frontend/Util/LocalStorage";
  import MailAutocomplete from "../../Mail/Composer/MailAutocomplete.svelte";
  import { ArrayColl } from "svelte-collections";
  import { t } from "../../../l10n/l10n";

  export let event: Event;
  export let flow: EventEditFlow;
  export let readOnly = false;
  export let autofocus = false;

  const ribbonLayout = getLocalStorage<RibbonLayout>("lookout.ribbon.layout", "classic");
  let addressField: MailAutocomplete;

  $: attendees = event.participants.filterObservable(participant => participant.response != InvitationResponse.Organizer);
  let recipients = new ArrayColl<PersonUID>([...new Set(flow.attendees)]);

  $: takeAttendees($attendees.contents);
  function takeAttendees(current: PersonUID[]) {
    if (!EventEditFlow.sameAddresses(current, recipients.contents)) {
      recipients.replaceAll([...new Set(current)]);
    }
  }

  $: giveRecipients($recipients.contents);
  function giveRecipients(current: PersonUID[]) {
    if (!EventEditFlow.sameAddresses(current, flow.attendees)) {
      flow.setAttendees(current);
    }
  }

  export function focus() {
    addressField?.focus();
  }

  export async function checkNames(): Promise<boolean> {
    return await addressField.checkNames();
  }
</script>

<style>
  .attendees-field {
    flex: 1 1 0;
    min-width: 0;
  }
</style>
