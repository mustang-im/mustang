<Header
  title={$t`Link with QR code`}
  subtitle={$t`On your phone, open WhatsApp, tap Settings, then Linked devices, then Link a device, and scan this code`}
/>

<hbox class="qr-area">
  <vbox class="qr-placeholder">
    <hbox class="qr-label">{$t`QR code`}</hbox>
  </vbox>
</hbox>
<hbox class="hint">
  {$t`Linking as a device is not available yet. You can continue and import your chat history from a backup.`}
</hbox>

<ButtonsBottom
  onContinue={onContinue}
  canContinue={true}
  canCancel={true}
  onCancel={onCancel}
  />

<script lang="ts">
  import type { WhatsAppAccount } from "../../../../logic/Chat/WhatsApp/WhatsAppAccount";
  import Header from "../../Shared/Header.svelte";
  import ButtonsBottom from "../../Shared/ButtonsBottom.svelte";
  import ExportInstructions from "./ExportInstructions.svelte";
  import { t } from "../../../../l10n/l10n";

  /** in/out */
  export let config: WhatsAppAccount;
  /** out */
  export let showPage: ConstructorOfATypedSvelteComponent;
  export let onCancel = (event: Event) => undefined;

  function onContinue() {
    showPage = ExportInstructions;
  }
</script>

<style>
  .qr-area {
    justify-content: center;
    margin: 24px;
  }
  .qr-placeholder {
    width: 180px;
    height: 180px;
    border: 2px dashed var(--border, #BBBBBB);
    border-radius: 8px;
    align-items: center;
    justify-content: center;
  }
  .qr-label {
    opacity: 50%;
  }
  .hint {
    justify-content: center;
    opacity: 65%;
    font-weight: 300;
  }
</style>
