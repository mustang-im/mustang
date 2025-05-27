<Header
  title={$t`Set up your file sharing account`}
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
  import { FileSharingAccount } from "../../../logic/Files/FileSharingAccount";
  import { newFileSharingAccountForProtocol } from "../../../logic/Files/AccountsList/FileSharingAccounts";
  import WebDAVSetup from "./WebDAVSetup.svelte";
  import ProtocolSelector, { ProtocolDescription } from "../Shared/ProtocolSelector.svelte";
  import ButtonsBottom from "../Shared/ButtonsBottom.svelte";
  import Header from "../Shared/Header.svelte";
  import { NotReached } from "../../../logic/util/util";
  import { t } from "../../../l10n/l10n";

  /** out */
  export let config: FileSharingAccount = null;
  /** out */
  export let showPage: ConstructorOfATypedSvelteComponent;
  export let onCancel = (event: Event) => undefined;

  let selectedProtocol: string;

  const protocols: ProtocolDescription[] = [
    { label: $t`New WebDAV account` + ` (openCloud, NextCloud, OneDrive, SharePoint, GMX)`, protocolID: "webdav" },
  ];

  function onContinue() {
    config = newFileSharingAccountForProtocol(selectedProtocol);
    if (selectedProtocol == "webdav") {
      showPage = WebDAVSetup;
    } else {
      throw new NotReached();
    }
  }
</script>

<style>
</style>
