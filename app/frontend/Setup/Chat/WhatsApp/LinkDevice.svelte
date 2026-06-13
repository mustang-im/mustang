<Header
  title={$t`Connect WhatsApp`}
  subtitle={$t`WhatsApp on your phone can grant access to your account`}
/>

<hbox class="splitscreen">
  <vbox>
    {#if paired}
      <vbox class="status success">
        <StatusMessage status="success" message={$t`Device linked`} />
      </vbox>
    {:else if error}
      <vbox class="status error">
        <ErrorMessageInline ex={error} />
        <Button label={$t`Try again`} classes="secondary" onClick={startLinking} />
      </vbox>
    {:else if linking}
      <hbox class="status inprogress">
        <StatusMessage status="processing" message={$t`Linking your account…`} />
      </hbox>
    {:else if qrData}
      <vbox class="qr-area">
        <QRCode data={qrData} size={264} />
      </vbox>
    {:else}
      <vbox class="status">
        <hbox class="label">{liveEnabled ? $t`Preparing code…` : $t`Disabled in this build`}</hbox>
        {#if !liveEnabled}
          <hbox class="note">
            {$t`Live linking is not enabled in this build yet. You can still import your existing chat history from a backup below.`}
          </hbox>
        {/if}
      </vbox>
    {/if}
  </vbox>
  {#if !paired}
    <vbox class="instructions">
      <ol>
        <li>{$t`Open WhatsApp on your phone`}</li>
        <li>{@html $t`Tap menu <span class="mock-button">⋮</span>, then <span class="mock-button">Settings</span>, then <span class="mock-button">Linked devices</span>`}</li>
        <li>{@html $t`Tap <span class="mock-button">Link a device</span>`}</li>
        <li>{$t`Scan this code with your phone camera`}</li>
      </ol>
    </vbox>
  {/if}
</hbox>

<ButtonsBottom canContinue={false} showContinue={false} canCancel={true} onCancel={onCancelLink}>
  <Button label={$t`Import messages from backup`} classes="secondary" onClick={onImportBackup} />
</ButtonsBottom>

<script lang="ts">
  import type { WhatsAppAccount } from "../../../../logic/Chat/WhatsApp/WhatsAppAccount";
  import { WhatsAppSetup } from "../../../../logic/Chat/WhatsApp/WhatsAppAccount";
  import { WhatsAppPairing } from "../../../../logic/Chat/WhatsApp/WhatsAppPairing";
  import { isWhatsAppLiveAvailable } from "../../../../logic/Chat/WhatsApp/WhatsAppConnection";
  import { appGlobal } from "../../../../logic/app";
  import Header from "../../Shared/Header.svelte";
  import StatusMessage from "../../Shared/StatusMessage.svelte";
  import ButtonsBottom from "../../Shared/ButtonsBottom.svelte";
  import Button from "../../../Shared/Button.svelte";
  import QRCode from "../../../Shared/QRCode.svelte";
  import ErrorMessageInline from "../../../Shared/ErrorMessageInline.svelte";
  import ExportInstructions from "./ExportInstructions.svelte";
  import { t } from "../../../../l10n/l10n";
  import { onMount, onDestroy } from "svelte";

  /** in/out */
  export let config: WhatsAppAccount;
  /** out */
  export let showPage: ConstructorOfATypedSvelteComponent;
  export let onCancel = (event: Event) => undefined;

  const liveEnabled = isWhatsAppLiveAvailable();

  /** The QR payload (ref,noiseKey,identityKey,advSecret) the phone scans. It
   * rotates as each server ref expires, until the user links or it fails. */
  let qrData: string | null = null;
  let error: Error | null = null;
  /** True once the phone scanned the QR and pairing is finishing, until done. */
  let linking = false;
  let paired = false;
  let closing = false;

  config.name = "WhatsApp";
  config.setup ??= new WhatsAppSetup();

  onMount(() => {
    if (liveEnabled) {
      startLinking();
    }
  });

  onDestroy(() => {
    closing = true;
    config.cancelPairing();
  });

  async function startLinking() {
    error = null;
    qrData = null;
    linking = false;
    try {
      await config.startPairing(qr => qrData = qr, () => {
        linking = true;
        qrData = null; // hide the QR the instant the scan is confirmed
      });
      qrData = null;
      paired = true;
      if (!appGlobal.chatAccounts.includes(config)) {
        appGlobal.chatAccounts.add(config);
      }
      await config.save();
      showPage = null; // finish the wizard
    } catch (ex) {
      if (!closing && !WhatsAppPairing.isCancelled(ex)) {
        error = ex as Error;
      }
    }
  }

  function onCancelLink(event: Event) {
    config.cancelPairing();
    onCancel(event);
  }

  function onImportBackup() {
    showPage = ExportInstructions;
  }
</script>

<style>
  .splitscreen {
    margin-block-start: 8px;
    gap: 24px;
    flex-wradp: wrap;
  }
  .qr-area,
  .status {
    align-items: center;
    justify-content: center;
    width: 250px;
    height: 250px;
    padding: 8px;
    gap: 12px;
  }
  .qr-area {
    border: 2px dashed var(--border, #BBBBBB);
    border-radius: 8px;
  }
  .status.error {
    border-color: var(--error-fg, #CC0000);
  }
  .status.success > :global(.status) {
    max-width: 70%;
  }
  .label {
    opacity: 50%;
    text-align: center;
    padding: 8px;
  }
  .instructions {
    justify-content: center;
  }
  li {
    margin-block-end: 6px;
    line-height: 1.4;
  }
  .note {
    margin-block-start: 12px;
    opacity: 65%;
    font-weight: 300;
  }
  .alternatives {
    margin-block-start: 28px;
    align-items: stretch;
    gap: 8px;
  }
  .or {
    justify-content: center;
    opacity: 55%;
    margin-block-end: 4px;
  }
  .instructions :global(.mock-button) {
    display: inline-block;
    border: 1px solid var(--border);
    padding: 0px 4px;
    margin: 2px 0px;
  }
</style>
