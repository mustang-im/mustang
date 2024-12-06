<Header
  title={$t`Set up your addressbook`}
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
  import type { Addressbook } from "../../../logic/Contacts/Addressbook";
  import { newAddressbookForProtocol } from "../../../logic/Contacts/AccountsList/Addressbooks";
  import LocalAddressbook from "./LocalAddressbook.svelte";
  import ProtocolSelector, { ProtocolDescription } from "../Shared/ProtocolSelector.svelte";
  import ButtonsBottom from "../Shared/ButtonsBottom.svelte";
  import Header from "../Shared/Header.svelte";
  import { NotReached } from "../../../logic/util/util";
  import { t } from "../../../l10n/l10n";

  /** out */
  export let config: Addressbook = null;
  /** out */
  export let showPage: ConstructorOfATypedSvelteComponent;
  export let onCancel = (event: Event) => undefined;

  let selectedProtocol: string;

  const protocols: ProtocolDescription[] = [
    { label: $t`New local addressbook`, protocolID: "addressbook-local" },
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
