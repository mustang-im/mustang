<Header
  title={$t`Set up your meeting account`}
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
  import type { MeetAccount } from "../../../logic/Meet/MeetAccount";
  import { newMeetAccountForProtocol } from "../../../logic/Meet/AccountsList/MeetAccounts";
  import M3Login from "./M3Login.svelte";
  import LiveKitLogin from "./LiveKitLogin.svelte";
  import SIPLogin from "./SIPLogin.svelte";
  import ProtocolSelector, { ProtocolDescription } from "../Shared/ProtocolSelector.svelte";
  import ButtonsBottom from "../Shared/ButtonsBottom.svelte";
  import Header from "../Shared/Header.svelte";
  import { NotReached } from "../../../logic/util/util";
  import { appName } from "../../../logic/build";
  import { t } from "../../../l10n/l10n";

  /** out */
  export let config: MeetAccount = null;
  /** out */
  export let showPage: ConstructorOfATypedSvelteComponent;
  export let onCancel = () => undefined;

  let selectedProtocol: string;

  const protocols: ProtocolDescription[] = [
    { label: $t`${appName} video conference account`, protocolID: "livekit" },
    //{ label: $t`M3 video conference account`, protocolID: "m3" },
    { label: $t`${"SIP"} telephone account`, protocolID: "sip" },
  ];

  function onContinue() {
    config = newMeetAccountForProtocol(selectedProtocol);
    if (selectedProtocol == "m3") {
      showPage = M3Login;
    } else if (selectedProtocol == "livekit") {
      showPage = LiveKitLogin;
    } else if (selectedProtocol == "sip") {
      showPage = SIPLogin;
    } else {
      throw new NotReached();
    }
  }
</script>

<style>
</style>
