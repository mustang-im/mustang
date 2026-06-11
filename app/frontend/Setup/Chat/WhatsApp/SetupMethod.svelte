<Header
  title={$t`Set up your WhatsApp account`}
  subtitle={$t`Choose how to connect to your existing WhatsApp account`}
/>

<vbox class="methods">
  <label class="method">
    <input type="radio" bind:group={method} value="phone" name="method" />
    <span class="name">{$t`Phone number`}</span>
  </label>
  <label class="method">
    <input type="radio" bind:group={method} value="qr-code" name="method" />
    <span class="name">{$t`Scan QR code with the WhatsApp app on your phone`}</span>
  </label>
  <label class="method">
    <input type="radio" bind:group={method} value="skip" name="method" />
    <span class="name">{$t`Skip and only import my chat history from a backup`}</span>
  </label>
</vbox>

<ButtonsBottom
  onContinue={onContinue}
  canContinue={!!method}
  canCancel={true}
  onCancel={onCancel}
  />

<script lang="ts">
  import { WhatsAppSetup, type WhatsAppAccount } from "../../../../logic/Chat/WhatsApp/WhatsAppAccount";
  import Header from "../../Shared/Header.svelte";
  import ButtonsBottom from "../../Shared/ButtonsBottom.svelte";
  import PhoneNumber from "./PhoneNumber.svelte";
  import QRCode from "./QRCode.svelte";
  import ExportInstructions from "./ExportInstructions.svelte";
  import { t } from "../../../../l10n/l10n";

  /** in/out */
  export let config: WhatsAppAccount;
  /** out */
  export let showPage: ConstructorOfATypedSvelteComponent;
  export let onCancel = (event: Event) => undefined;

  let method: "phone" | "qr-code" | "skip" = "skip";

  function onContinue() {
    config.name = "WhatsApp";
    config.setup ??= new WhatsAppSetup();
    if (method == "phone") {
      showPage = PhoneNumber;
    } else if (method == "qr-code") {
      showPage = QRCode;
    } else {
      showPage = ExportInstructions;
    }
  }
</script>

<style>
  .methods {
    margin-block-start: 6px;
    align-items: start;
  }
  .method {
    padding: 2px 20px 2px 12px;
    margin: 2px;
  }
  .name {
    margin-inline-start: 8px;
  }
</style>
