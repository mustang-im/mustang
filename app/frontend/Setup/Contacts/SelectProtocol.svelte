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
  import LocalAddressbookSetup from "./LocalAddressbookSetup.svelte";
  import CardDAVSetup from "./CardDAVSetup.svelte";
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
    { label: $t`New CardDAV addressbook`, protocolID: "carddav" },
  ];

  function onContinue() {
    config = newAddressbookForProtocol(selectedProtocol);
    if (selectedProtocol == "addressbook-local") {
      showPage = LocalAddressbookSetup;
    } else if (selectedProtocol == "carddav") {
      showPage = CardDAVSetup;
    } else {
      throw new NotReached();
    }
  }
</script>

<style>
</style>
