<Header
  title={$t`Export your chat history`}
  subtitle={$t`Create an encrypted backup on your phone and copy it to this computer`}
/>

<BackupInstructions />

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
  import BackupInstructions from "./BackupInstructions.svelte";
  import DecryptionKeyInput from "./DecryptionKeyInput.svelte";
  import { t } from "../../../../l10n/l10n";

  /** in/out */
  export let config: WhatsAppAccount;
  /** out */
  export let showPage: ConstructorOfATypedSvelteComponent;
  export let onCancel = (event: Event) => undefined;

  function onContinue() {
    showPage = DecryptionKeyInput;
  }
</script>
