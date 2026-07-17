<vbox class="settings">
  <HeaderGroupBox>
    <hbox slot="header">{$t`Import`}</hbox>

    {#if !showForm}
      <vbox class="intro">
        <hbox class="buttons">
          <Button label={$t`Import from backup…`} onClick={() => showForm = true} />
        </hbox>
      </vbox>
    {:else if importing}
      <vbox class="stats">
        <StatusMessage status="processing" message={statusMessage} />
        {#if progress}
          <ProgressBar value={progress.chatsDone} max={progress.chatsTotal} showETA={false}
            label={$t`Chat ${Math.min(progress.chatsDone + 1, progress.chatsTotal)} of ${progress.chatsTotal}: ${progress.currentChat ?? ""}`}
            />
          <ProgressBar value={progress.messagesDone} max={progress.messagesTotal}
            label={$t`${progress.messagesDone} of ${progress.messagesTotal} messages`}
            />
        {/if}
      </vbox>
    {:else if done}
      <vbox class="stats">
        <StatusMessage status="success" message={$t`Import complete`} />
        <hbox>{$t`${progress.chatsDone} chats`}</hbox>
        <hbox>{$t`${progress.newMessages} new messages`}</hbox>
        {#if progress.knownMessages}
          <hbox>{$t`${progress.knownMessages} messages were already here`}</hbox>
        {/if}
        <hbox class="buttons">
          <Button label={$t`Done`} onClick={reset} />
        </hbox>
      </vbox>
    {:else}
      <vbox class="form">
        <hbox class="explanation">
          {$t`Import your full chat history from an encrypted backup of WhatsApp on your phone.`}
          {$t`Messages that are already here are skipped.`}
        </hbox>
        <BackupInstructions />
        <grid>
          <hbox class="label">{$t`Messages`}</hbox>
          <Button label={msgstoreFile ? msgstoreFile.name : $t`Select msgstore.db.crypt15 …`}
            classes="secondary" onClick={selectMsgstoreFile} />
          <hbox class="label">{$t`Contact names (optional)`}</hbox>
          <Button label={waDBFile ? waDBFile.name : $t`Select wa.db.crypt15 …`}
            classes="secondary" onClick={selectWADBFile} />
          <hbox class="label">{$t`Backup key`}</hbox>
          <textarea bind:value={keyInput} rows="2" spellcheck="false"
            placeholder="1234 5678 90ab cdef …"></textarea>
        </grid>
        {#if error}
          <ErrorMessageInline ex={error} />
        {/if}
        <hbox class="buttons">
          <Button label={$t`Cancel`} onClick={reset} />
          <Button label={$t`Import`} classes="primary" onClick={startImport} disabled={!canImport} />
        </hbox>
      </vbox>
    {/if}
  </HeaderGroupBox>
</vbox>

<FileSelector bind:this={fileSelector} acceptFileTypes={[".crypt15"]} />

<script lang="ts">
  import type { WhatsAppAccount } from "../../../logic/Chat/WhatsApp/WhatsAppAccount";
  import { decryptCrypt15, sanitizeKeyHex } from "../../../logic/Chat/WhatsApp/Import/crypt15";
  import { WhatsAppBackupImport, ImportProgress } from "../../../logic/Chat/WhatsApp/Import/ImportBackup";
  import BackupInstructions from "../../Setup/Chat/WhatsApp/BackupInstructions.svelte";
  import FileSelector from "../../Mail/Composer/Attachments/FileSelector.svelte";
  import HeaderGroupBox from "../../Shared/HeaderGroupBox.svelte";
  import Button from "../../Shared/Button.svelte";
  import ProgressBar from "../../Shared/ProgressBar.svelte";
  import ErrorMessageInline from "../../Shared/ErrorMessageInline.svelte";
  import StatusMessage from "../../Setup/Shared/StatusMessage.svelte";
  import { t } from "../../../l10n/l10n";

  export let account: WhatsAppAccount;

  let fileSelector: FileSelector;
  let showForm = false;
  let msgstoreFile: File | null = null;
  let waDBFile: File | null = null;
  let keyInput = "";
  let importing = false;
  let done = false;
  let error: Error | null = null;
  let progress: ImportProgress | null = null;
  let statusMessage = "";

  $: canImport = !!msgstoreFile && isValidKey(keyInput);

  function isValidKey(key: string): boolean {
    try {
      sanitizeKeyHex(key);
      return true;
    } catch (ex) {
      return false;
    }
  }

  async function selectMsgstoreFile() {
    msgstoreFile = await fileSelector.selectFile() ?? msgstoreFile;
  }
  async function selectWADBFile() {
    waDBFile = await fileSelector.selectFile() ?? waDBFile;
  }

  async function startImport() {
    error = null;
    importing = true;
    try {
      let keyHex = sanitizeKeyHex(keyInput);
      statusMessage = $t`Decrypting backup…`;
      let msgstoreDB = await decryptCrypt15(new Uint8Array(await msgstoreFile.arrayBuffer()), keyHex);
      let waDB = waDBFile
        ? await decryptCrypt15(new Uint8Array(await waDBFile.arrayBuffer()), keyHex)
        : null;
      statusMessage = $t`Reading chats…`;
      // Imports on top of the live account: existing rooms are re-used and messages
      // already synced are skipped, by their WhatsApp key id.
      let importer = new WhatsAppBackupImport(account, p => progress = Object.assign(new ImportProgress(), p));
      await importer.importBackup(msgstoreDB, waDB);
      progress = importer.progress;
      done = true;
    } catch (ex) {
      error = ex as Error;
    } finally {
      importing = false;
    }
  }

  function reset() {
    showForm = false;
    done = false;
    error = null;
    importing = false;
    msgstoreFile = null;
    waDBFile = null;
    keyInput = "";
    progress = null;
  }
</script>

<style>
  .settings {
    align-items: start;
    justify-content: start;
  }
  .settings > :global(.group) {
    width: 100%;
  }
  .explanation {
    margin-block-end: 12px;
    line-height: 1.4;
  }
  .form > grid {
    grid-template-columns: max-content auto;
    align-items: center;
    margin: 16px 0px;
    gap: 8px 24px;
  }
  textarea {
    font-family: monospace;
    font-size: 16px;
    padding: 8px;
  }
  .stats {
    gap: 8px;
  }
  .buttons {
    align-items: center;
    gap: 12px;
  }
</style>
