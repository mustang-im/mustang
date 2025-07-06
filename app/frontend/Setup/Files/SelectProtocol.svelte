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
    { label: `openCloud, ownCloud`, protocolID: "webdav" },
    { label: `NextCloud`, protocolID: "webdav" },
    { label: `OneDrive`, protocolID: "webdav" },
    { label: `SharePoint`, protocolID: "webdav" },
    { label: `GMX, web.de, 1&1`, protocolID: "webdav" },
    { label: $t`WebDAV` },
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
