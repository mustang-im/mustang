<Header
  title="Set up your addressbook"
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
  import type { Addressbook } from "../../../../logic/Contacts/Addressbook";
  import { newAddressbookForProtocol } from "../../../../logic/Contacts/AccountsList/Addressbooks";
  import ProtocolSelector, { ProtocolDescription } from "../ProtocolSelector.svelte";
  import LocalAddressbook from "./LocalAddressbook.svelte";
  import ButtonsBottom from "../ButtonsBottom.svelte";
  import Header from "../Header.svelte";
  import { NotReached } from "../../../../logic/util/util";
  import { catchErrors } from "../../../Util/error";

  /** out */
  export let config: Addressbook = null;
  /** out */
  export let showPage: ConstructorOfATypedSvelteComponent;

  let selectedProtocol: string;

  const protocols: ProtocolDescription[] = [
    { label: "Local addressbook", protocolID: "addressbook-local" },
  ];

  function onContinue() {
    config = newAddressbookForProtocol(selectedProtocol);
    if (selectedProtocol == "addressbook-local") {
      showPage = LocalAddressbook;
    } else {
      throw new NotReached();
    }
  }
</script>

<style>
</style>
