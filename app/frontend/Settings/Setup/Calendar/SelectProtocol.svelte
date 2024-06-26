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
  import type { Calendar } from "../../../../logic/Calendar/Calendar";
  import { newCalendarForProtocol } from "../../../../logic/Calendar/AccountsList/Calendars";
  import LocalCalendar from "./LocalCalendar.svelte";
  import ProtocolSelector, { ProtocolDescription } from "../Shared/ProtocolSelector.svelte";
  import ButtonsBottom from "../Shared/ButtonsBottom.svelte";
  import Header from "../Shared/Header.svelte";
  import { NotReached } from "../../../../logic/util/util";
  import { t } from "svelte-i18n-lingui";

  /** out */
  export let config: Calendar = null;
  /** out */
  export let showPage: ConstructorOfATypedSvelteComponent;
  export let onCancel = (event: Event) => undefined;

  let selectedProtocol: string;

  const protocols: ProtocolDescription[] = [
    { label: $t`New local calendar`, protocolID: "calendar-local" },
  ];

  function onContinue() {
    config = newCalendarForProtocol(selectedProtocol);
    if (selectedProtocol == "calendar-local") {
      showPage = LocalCalendar;
    } else {
      throw new NotReached();
    }
  }
</script>

<style>
</style>
