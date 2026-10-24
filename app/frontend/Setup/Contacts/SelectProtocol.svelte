<Header
  title={$t`Set up your addressbook`}
  subtitle=""
/>

<ProtocolSelector {protocols} bind:selectedProtocol={selectedProtocol} />

{#if addonAccount}
  <AddonAccountSetup account={addonAccount} bind:this={addonSetup} />
{/if}

<ErrorMessageInline bind:this={errorUI} />

<ButtonsBottom
  onContinue={() => catchErrors(onContinue, errorUI.showError)}
  canContinue={!!selectedProtocol}
  canCancel={true}
  onCancel={onCancel}
  />

<script lang="ts">
  import type { Addressbook } from "../../../logic/Contacts/Addressbook";
  import { newAddressbookForProtocol } from "../../../logic/Contacts/AccountsList/Addressbooks";
  import type { AddonAddressbook } from "../../../logic/Contacts/Addon/AddonAddressbook";
  import { addonProtocols } from "../../../logic/Addons/AddonProtocols";
  import { appGlobal } from "../../../logic/app";
  import AddonAccountSetup from "../Addon/AddonAccountSetup.svelte";
  import LocalAddressbookSetup from "./LocalAddressbookSetup.svelte";
  import CardDAVSetup from "./CardDAVSetup.svelte";
  import ProtocolSelector, { ProtocolDescription } from "../Shared/ProtocolSelector.svelte";
  import ButtonsBottom from "../Shared/ButtonsBottom.svelte";
  import Header from "../Shared/Header.svelte";
  import ErrorMessageInline from "../../Shared/ErrorMessageInline.svelte";
  import { catchErrors } from "../../Util/error";
  import { NotReached } from "../../../logic/util/util";
  import { t } from "../../../l10n/l10n";

  /** out */
  export let config: Addressbook = null;
  /** out */
  export let showPage: ConstructorOfATypedSvelteComponent;
  export let onCancel = (event: Event) => undefined;

  let selectedProtocol: string;
  let addonSetup: AddonAccountSetup;
  let errorUI: ErrorMessageInline;

  const appProtocols: ProtocolDescription[] = [
    { label: $t`New local addressbook`, protocolID: "addressbook-local" },
    { label: $t`New CardDAV addressbook`, protocolID: "carddav" },
  ];
  $: protocols = appProtocols.concat($addonProtocols.contents.filter(protocol => protocol.type == "contacts").map(protocol => ({ label: protocol.label, protocolID: protocol.protocol })));
  $: addonAccount = $addonProtocols.some(protocol => protocol.protocol == selectedProtocol) ? newAddressbookForProtocol(selectedProtocol) as AddonAddressbook : null;

  async function onContinue() {
    if (addonAccount) {
      await addonSetup.onContinue();
      await addonAccount.login(true);
      await addonAccount.listContacts(); // check whether it works
      appGlobal.addressbooks.add(addonAccount);
      await addonAccount.save();
      showPage = null;
      return;
    }
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
