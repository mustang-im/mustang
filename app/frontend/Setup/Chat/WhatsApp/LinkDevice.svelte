<Header
  title={$t`Link WhatsApp`}
  subtitle={$t`Link this app to your phone, the same way as WhatsApp Web`}
/>

<hbox class="qr-row">
  <vbox class="qr-area">
    <vbox class="qr-placeholder">
      {#if qrData}
        <!-- A real QR of qrData would render here once live pairing is enabled -->
        <hbox class="qr-label">{$t`Scan with your phone`}</hbox>
      {:else}
        <hbox class="qr-label">{$t`Preparing code…`}</hbox>
      {/if}
    </vbox>
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

<ButtonsBottom canContinue={false} showContinue={false} canCancel={true} onCancel={onCancel} />

<script lang="ts">
  import type { WhatsAppAccount } from "../../../../logic/Chat/WhatsApp/WhatsAppAccount";
  import { WhatsAppSetup } from "../../../../logic/Chat/WhatsApp/WhatsAppAccount";
  import { kWhatsAppLiveEnabled } from "../../../../logic/Chat/WhatsApp/WhatsAppConnection";
  import Header from "../../Shared/Header.svelte";
  import ButtonsBottom from "../../Shared/ButtonsBottom.svelte";
  import Button from "../../../Shared/Button.svelte";
  import ExportInstructions from "./ExportInstructions.svelte";
  import { t } from "../../../../l10n/l10n";

  /** in/out */
  export let config: WhatsAppAccount;
  /** out */
  export let showPage: ConstructorOfATypedSvelteComponent;
  export let onCancel = (event: Event) => undefined;

  let liveEnabled = kWhatsAppLiveEnabled;
  // The QR payload (ref,noiseKey,identityKey,advSecret,platform) is produced by
  // the pairing flow once the live connection is enabled; gated for now.
  let qrData: string | null = liveEnabled ? "" : null;

  config.name = "WhatsApp";
  config.setup ??= new WhatsAppSetup();

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
  }
  .qr-placeholder {
    width: 200px;
    height: 200px;
    border: 2px dashed var(--border, #BBBBBB);
    border-radius: 8px;
    align-items: center;
    justify-content: center;
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
