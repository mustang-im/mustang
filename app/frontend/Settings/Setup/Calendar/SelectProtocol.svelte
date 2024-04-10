<Header
  title="Set up your calendar"
  subtitle=""
/>

<ProtocolSelector {protocols} bind:selectedProtocol={selectedProtocol} />

<ButtonsBottom
  on:continue={() => catchErrors(onContinue)}
  canContinue={!!selectedProtocol}
  canCancel={true}
  on:cancel
  />

<script lang="ts">
  import type { Calendar } from "../../../../logic/Calendar/Calendar";
  import { newCalendarForProtocol } from "../../../../logic/Calendar/AccountsList/Calendars";
  import ProtocolSelector, { ProtocolDescription } from "../ProtocolSelector.svelte";
  import LocalCalendar from "./LocalCalendar.svelte";
  import ButtonsBottom from "../ButtonsBottom.svelte";
  import Header from "../Header.svelte";
  import { NotReached } from "../../../../logic/util/util";
  import { catchErrors } from "../../../Util/error";

  /** out */
  export let config: Calendar = null;
  /** out */
  export let showPage: ConstructorOfATypedSvelteComponent;

  let selectedProtocol: string;

  const protocols: ProtocolDescription[] = [
    { label: "New local calendar", protocolID: "calendar-local" },
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
