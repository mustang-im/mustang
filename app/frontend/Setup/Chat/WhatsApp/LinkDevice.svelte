<Header
  title={$t`Link WhatsApp`}
  subtitle={$t`Link this app to your phone, the same way as WhatsApp Web`}
/>

<hbox class="qr-row">
  <vbox class="qr-area">
    {#if paired}
      <vbox class="qr-placeholder success">
        <StatusMessage status="success" message={$t`Device linked`} />
      </vbox>
    {:else if error}
      <vbox class="qr-placeholder error">
        <ErrorMessageInline ex={error} />
        <Button label={$t`Try again`} classes="secondary" onClick={startLinking} />
      </vbox>
    {:else if linking}
      <vbox class="qr-placeholder">
        <StatusMessage status="processing" message={$t`Linking your account…`} />
      </vbox>
    {:else if qrData}
      <QRCode data={qrData} size={264} />
    {:else}
      <vbox class="qr-placeholder">
        <hbox class="qr-label">{liveEnabled ? $t`Preparing code…` : $t`Disabled in this build`}</hbox>
      </vbox>
    {/if}
  </vbox>
  <vbox class="instructions">
    <ol>
      <li>{$t`Open WhatsApp on your phone.`}</li>
      <li>{$t`Tap Settings, then Linked devices.`}</li>
      <li>{$t`Tap Link a device.`}</li>
      <li>{$t`Point your phone at this screen to scan the code.`}</li>
    </ol>
    {#if !liveEnabled}
      <hbox class="note">
        {$t`Live linking is not enabled in this build yet. You can still import your existing chat history from a backup below.`}
      </hbox>
    {/if}
  </vbox>
</hbox>

<vbox class="alternatives">
  <hbox class="or">{$t`or`}</hbox>
  <Button label={$t`Import chat history from a backup`} classes="secondary" onClick={onImportBackup} />
</vbox>

<ButtonsBottom canContinue={false} showContinue={false} canCancel={true} onCancel={onCancelLink} />

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
  .qr-row {
    margin-block-start: 8px;
    gap: 24px;
  }
  .qr-area {
    justify-content: center;
    align-items: center;
    min-width: 264px;
  }
  .qr-placeholder {
    width: 200px;
    height: 200px;
    border: 2px dashed var(--border, #BBBBBB);
    border-radius: 8px;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 8px;
  }
  .qr-placeholder.error {
    border-color: var(--error-fg, #CC0000);
  }
  .qr-placeholder.success {
    border-style: solid;
    border-color: var(--success-fg, #33A852);
  }
  .qr-label {
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
</style>
