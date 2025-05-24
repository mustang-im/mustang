<Header
  title={$t`Set up your calendar`}
  subtitle=""
/>

<ProtocolSelector {protocols} bind:selectedProtocol={selectedProtocol} />

<ButtonsBottom
  onContinue={onContinue}
  canContinue={!!selectedProtocol}
  canCancel={true}
  onCancel={onCancel}
  />

<script lang="ts">
  import type { Calendar } from "../../../logic/Calendar/Calendar";
  import { newCalendarForProtocol } from "../../../logic/Calendar/AccountsList/Calendars";
  import LocalCalendarSetup from "./LocalCalendarSetup.svelte";
  import CalDAVSetup from "./CalDAVSetup.svelte";
  import ProtocolSelector, { ProtocolDescription } from "../Shared/ProtocolSelector.svelte";
  import ButtonsBottom from "../Shared/ButtonsBottom.svelte";
  import Header from "../Shared/Header.svelte";
  import { NotReached } from "../../../logic/util/util";
  import { t } from "../../../l10n/l10n";

  /** out */
  export let config: Calendar = null;
  /** out */
  export let showPage: ConstructorOfATypedSvelteComponent;
  export let onCancel = (event: Event) => undefined;

  let selectedProtocol: string;

  const protocols: ProtocolDescription[] = [
    { label: $t`New local calendar`, protocolID: "calendar-local" },
    { label: $t`New CalDAV calendar`, protocolID: "caldav" },
  ];

  function onContinue() {
    config = newCalendarForProtocol(selectedProtocol);
    if (selectedProtocol == "calendar-local") {
      showPage = LocalCalendarSetup;
    } else if (selectedProtocol == "caldav") {
      showPage = CalDAVSetup;
    } else {
      throw new NotReached();
    }
  }
</script>

<style>
</style>
