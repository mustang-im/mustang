<Header
  title={$t`Your backup key`}
  subtitle={$t`Enter the 64-digit encryption key that WhatsApp showed when you turned on the encrypted backup`}
/>

<vbox flex class="key-entry">
  <textarea bind:value={keyInput} rows="3" autofocus spellcheck="false"
    placeholder="1234 5678 90ab cdef …"></textarea>
  {#if keyInput && !isValid}
    <hbox class="hint">
      {$t`The key consists of 64 characters: digits 0-9 and letters a-f. Spaces and multiple lines are OK.`}
    </hbox>
  {/if}
</vbox>

<ButtonsBottom
  onContinue={onContinue}
  canContinue={isValid}
  canCancel={true}
  onCancel={onCancel}
  />

<script lang="ts">
  import type { WhatsAppAccount } from "../../../../logic/Chat/WhatsApp/WhatsAppAccount";
  import { sanitizeKeyHex } from "../../../../logic/Chat/WhatsApp/Import/crypt15";
  import Header from "../../Shared/Header.svelte";
  import ButtonsBottom from "../../Shared/ButtonsBottom.svelte";
  import SelectFiles from "./SelectFiles.svelte";
  import { t } from "../../../../l10n/l10n";

  /** in/out */
  export let config: WhatsAppAccount;
  /** out */
  export let showPage: ConstructorOfATypedSvelteComponent;
  export let onCancel = (event: Event) => undefined;

  let keyInput: string = config.setup?.decryptKeyAsHex ?? "";
  let isValid = false;
  $: keyInput, validate();
  function validate() {
    try {
      sanitizeKeyHex(keyInput);
      isValid = true;
    } catch (ex) {
      isValid = false;
    }
  }

  function onContinue() {
    config.setup.decryptKeyAsHex = sanitizeKeyHex(keyInput);
    showPage = SelectFiles;
  }
</script>

<style>
  .key-entry {
    margin: 24px 0px;
  }
  textarea {
    font-family: monospace;
    font-size: 16px;
    padding: 8px;
  }
  .hint {
    margin-block-start: 8px;
    opacity: 65%;
    font-weight: 300;
  }
</style>
