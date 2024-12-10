<Header
  title={$t`Set up your existing chat account`}
  subtitle={$t`Import your existing chat account or create a new one`}
/>

<ProtocolSelector {protocols} bind:selectedProtocol={selectedProtocol} />

<ButtonsBottom
  onContinue={onContinue}
  canContinue={!!selectedProtocol}
  canCancel={true}
  onCancel={onCancel}
  />

<script lang="ts">
  import { newChatAccountForProtocol } from "../../../logic/Chat/AccountsList/ChatAccounts";
  import type { ChatAccount } from "../../../logic/Chat/ChatAccount";
  import ProtocolSelector, { ProtocolDescription } from "../Shared/ProtocolSelector.svelte";
  import ButtonsBottom from "../Shared/ButtonsBottom.svelte";
  import Header from "../Shared/Header.svelte";
  import XMPPLogin from "./XMPPLogin.svelte";
  import MatrixLogin from "./MatrixLogin.svelte";
  import { t } from "../../../l10n/l10n";

  /** out */
  export let config: ChatAccount = null;
  /** out */
  export let showPage: ConstructorOfATypedSvelteComponent;
  export let onCancel = () => undefined;

  let selectedProtocol: string;
  /*$: onSelectProtocol(selectedProtocol);
  function onSelectProtocol(protocol: string) {
    config = newChatAccountForProtocol(protocol);
  }*/

  const protocols: ProtocolDescription[] = [
    { label: "XMPP / Jabber", protocolID: "xmpp" },
    { label: "Matrix", protocolID: "matrix" },
  ];

  function onContinue() {
    config = newChatAccountForProtocol(selectedProtocol);
    if (selectedProtocol == "xmpp") {
      showPage = XMPPLogin;
    } else if (selectedProtocol == "matrix") {
      showPage = MatrixLogin;
    }
  }
</script>

<style>
</style>
