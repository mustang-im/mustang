<Header
  title={$t`Your phone number`}
  subtitle={$t`The phone number that you use with WhatsApp on your phone`}
/>

<vbox flex class="account">
  <grid>
    <label for="phone">{$t`Phone number`}</label>
    <input type="tel" bind:value={phoneNumber} name="phone"
      placeholder="+1 555 123 4567" autofocus />
  </grid>
  <hbox class="hint">
    {$t`Connecting via phone number is not available yet. You can continue and import your chat history from a backup.`}
  </hbox>
</vbox>

<ButtonsBottom
  onContinue={onContinue}
  canContinue={!!phoneNumber}
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

  let phoneNumber: string;

  function onContinue() {
    config.username = phoneNumber;
    showPage = ExportInstructions;
  }
</script>

<style>
  grid {
    grid-template-columns: max-content auto;
    align-items: center;
    margin: 32px;
    gap: 8px 24px;
  }
  .hint {
    opacity: 65%;
    font-weight: 300;
  }
</style>
