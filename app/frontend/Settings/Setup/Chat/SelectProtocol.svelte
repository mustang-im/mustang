<Header
  title="Set up your existing chat account"
  subtitle="You can use Mustang with your existing chat account or you can create a new chat account."
/>

<ProtocolSelector {protocols} bind:selectedProtocol={selectedProtocol} />

<ButtonsBottom
  on:continue={() => catchErrors(onContinue)}
  canContinue={!!selectedProtocol}
  hasCancel={true}
  on:cancel={() => catchErrors(onCancel)}
  />

<script lang="ts">
  import { newChatAccountForProtocol } from "../../../../logic/Chat/AccountsList/ChatAccounts";
  import type { ChatAccount } from "../../../../logic/Chat/ChatAccount";
  import ProtocolSelector, { ProtocolDescription } from "../ProtocolSelector.svelte";
  import ButtonsBottom from "../ButtonsBottom.svelte";
  import Header from "../Header.svelte";
  import XMPPLogin from "./XMPPLogin.svelte";
  import MatrixLogin from "./MatrixLogin.svelte";
  import { catchErrors } from "../../../Util/error";

  /** out */
  export let config: ChatAccount = null;
  /** out */
  export let showPage: ConstructorOfATypedSvelteComponent;

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

  function onCancel() {
    showPage = null;
  }
</script>

<style>
</style>
