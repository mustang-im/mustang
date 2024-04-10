<Header
  title="Set up your meeting account"
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
  import type { MeetAccount } from "../../../../logic/Meet/MeetAccount";
  import { newMeetAccountForProtocol } from "../../../../logic/Meet/AccountsList/MeetAccounts";
  import ProtocolSelector, { ProtocolDescription } from "../ProtocolSelector.svelte";
  import M3Login from "./M3Login.svelte";
  import ButtonsBottom from "../ButtonsBottom.svelte";
  import Header from "../Header.svelte";
  import { NotReached } from "../../../../logic/util/util";
  import { catchErrors } from "../../../Util/error";

  /** out */
  export let config: MeetAccount = null;
  /** out */
  export let showPage: ConstructorOfATypedSvelteComponent;

  let selectedProtocol: string;

  const protocols: ProtocolDescription[] = [
    { label: "Mustang video conference account", protocolID: "m3" },
  ];

  function onContinue() {
    config = newMeetAccountForProtocol(selectedProtocol);
    if (selectedProtocol == "m3") {
      showPage = M3Login;
    } else {
      throw new NotReached();
    }
  }
</script>

<style>
</style>
