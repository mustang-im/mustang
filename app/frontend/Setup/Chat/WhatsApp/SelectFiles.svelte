<Header
  title={$t`Select the backup files`}
  subtitle={$t`The encrypted backup files that you copied from your phone`}
/>

<vbox flex class="files">
  <grid>
    <hbox class="label">{$t`Messages`}</hbox>
    <Button label={msgstoreFile ? msgstoreFile.name : $t`Select msgstore.db.crypt15 …`}
      classes="secondary"
      onClick={selectMsgstoreFile}
      errorCallback={showError}
      />
    <hbox class="label">{$t`Contact names (optional)`}</hbox>
    <Button label={waDBFile ? waDBFile.name : $t`Select wa.db.crypt15 …`}
      classes="secondary"
      onClick={selectWADBFile}
      errorCallback={showError}
      />
  </grid>
</vbox>

<FileSelector bind:this={fileSelector} acceptFileTypes={[".crypt15"]} />

<ButtonsBottom
  onContinue={onContinue}
  canContinue={!!msgstoreFile}
  canCancel={true}
  onCancel={onCancel}
  />

<script lang="ts">
  import type { WhatsAppAccount } from "../../../../logic/Chat/WhatsApp/WhatsAppAccount";
  import Header from "../../Shared/Header.svelte";
  import ButtonsBottom from "../../Shared/ButtonsBottom.svelte";
  import Button from "../../../Shared/Button.svelte";
  import FileSelector from "../../../Mail/Composer/Attachments/FileSelector.svelte";
  import ImportProgress from "./ImportProgress.svelte";
  import { showError } from "../../../Util/error";
  import { t } from "../../../../l10n/l10n";

  /** in/out */
  export let config: WhatsAppAccount;
  /** out */
  export let showPage: ConstructorOfATypedSvelteComponent;
  export let onCancel = (event: Event) => undefined;

  let fileSelector: FileSelector;
  let msgstoreFile: File | null = config.setup?.msgStore;
  let waDBFile: File | null = config.setup?.waDB;

  async function selectMsgstoreFile() {
    msgstoreFile = await fileSelector.selectFile() ?? msgstoreFile;
  }

  async function selectWADBFile() {
    waDBFile = await fileSelector.selectFile() ?? waDBFile;
  }

  function onContinue() {
    config.setup.msgStore = msgstoreFile;
    config.setup.waDB = waDBFile;
    showPage = ImportProgress;
  }
</script>

<style>
  grid {
    grid-template-columns: max-content auto;
    align-items: center;
    margin: 32px;
    gap: 8px 24px;
  }
</style>
