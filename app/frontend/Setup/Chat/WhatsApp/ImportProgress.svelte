<Header
  title={$t`Importing your chat history`}
  subtitle={$t`This can take several minutes for large backups`}
/>

<vbox flex class="progress-area">
  {#if error}
    <ErrorMessageInline ex={error} />
  {:else if done}
    <StatusMessage status="success" message={$t`Import complete`} />
    <vbox class="stats">
      <hbox>{$t`${progress.chatsDone} chats`}</hbox>
      <hbox>{$t`${progress.newMessages} new messages`}</hbox>
      {#if progress.knownMessages}
        <hbox>{$t`${progress.knownMessages} messages were already imported earlier`}</hbox>
      {/if}
    </vbox>
  {:else}
    <StatusMessage status="processing" message={statusMessage} />
    {#if progress}
      <vbox class="stats">
        <ProgressBar value={progress.chatsDone} max={progress.chatsTotal} showETA={false}
          label={$t`Chat ${Math.min(progress.chatsDone + 1, progress.chatsTotal)} of ${progress.chatsTotal}: ${progress.currentChat ?? ""}`}
          />
        <ProgressBar value={progress.messagesDone} max={progress.messagesTotal}
          label={$t`${progress.messagesDone} of ${progress.messagesTotal} messages`}
          />
      </vbox>
    {/if}
  {/if}
</vbox>

<ButtonsBottom
  onContinue={onDone}
  canContinue={done && !error}
  showContinue={!error}
  labelContinue={$t`Done`}
  canCancel={!!error}
  onCancel={onCancel}
  />

<script lang="ts">
  import type { WhatsAppAccount } from "../../../../logic/Chat/WhatsApp/WhatsAppAccount";
  import { decryptCrypt15 } from "../../../../logic/Chat/WhatsApp/Import/crypt15";
  import { WhatsAppBackupImport, ImportProgress } from "../../../../logic/Chat/WhatsApp/Import/ImportBackup";
  import { appGlobal } from "../../../../logic/app";
  import Header from "../../Shared/Header.svelte";
  import ButtonsBottom from "../../Shared/ButtonsBottom.svelte";
  import StatusMessage from "../../Shared/StatusMessage.svelte";
  import ProgressBar from "../../../Shared/ProgressBar.svelte";
  import ErrorMessageInline from "../../../Shared/ErrorMessageInline.svelte";
  import { t, gt } from "../../../../l10n/l10n";
  import { onMount } from "svelte";

  /** in/out */
  export let config: WhatsAppAccount;
  /** out */
  export let showPage: ConstructorOfATypedSvelteComponent;
  export let onCancel = (event: Event) => undefined;

  let statusMessage = "";
  let progress: ImportProgress | null = null;
  let done = false;
  let error: Error | null = null;

  onMount(() => {
    startImport()
      .catch(ex => error = ex);
  });

  async function startImport() {
    statusMessage = gt`Decrypting backup…`;
    let setup = config.setup;
    let msgstoreDB = await decryptCrypt15(
      new Uint8Array(await setup.msgStore.arrayBuffer()), setup.decryptKeyAsHex);
    let waDB = setup.waDB
      ? await decryptCrypt15(
        new Uint8Array(await setup.waDB.arrayBuffer()), setup.decryptKeyAsHex)
      : null;

    statusMessage = gt`Reading chats…`;
    let importer = new WhatsAppBackupImport(config, p => progress = Object.assign(new ImportProgress(), p));
    await importer.importBackup(msgstoreDB, waDB);
    progress = importer.progress;
    if (!appGlobal.chatAccounts.includes(config)) {
      appGlobal.chatAccounts.add(config);
    }
    config.setup = null;
    done = true;
  }

  function onDone() {
    showPage = null;
  }
</script>

<style>
  .progress-area {
    margin: 24px 0px;
  }
  .stats {
    margin: 8px 16px;
    opacity: 75%;
  }
  .stats :global(.progress-bar) {
    margin-block-end: 12px;
  }
</style>
