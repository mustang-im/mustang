<Header
  title={$t`Export your chat history`}
  subtitle={$t`Create an encrypted backup on your phone and copy it to this computer`}
/>

<vbox class="instructions">
  <ol>
    <li>{$t`On your Android phone, open WhatsApp and tap the [⋮] menu | Settings | Chats | Chat backup.`}</li>
    <li>{$t`Tap [End-to-end encrypted backup], then [Turn on].`}</li>
    <li>{$t`Choose [Use 64-digit encryption key instead], then [Generate your 64-digit key]. Do not use the password method.`}</li>
    <li>{$t`Write down or save the 64-digit key. You will enter it in the next step. WhatsApp will not show it again.`}</li>
    <li>{$t`Tap Create to finish, then tap Back up and wait until the backup is complete.`}</li>
    <li>{$t`Connect your phone to this computer with a USB cable, and allow file transfer on the phone.`}</li>
    <li>{$t`From the phone folder "Android/media/com.whatsapp/WhatsApp/Databases/", copy the files "msgstore.db.crypt15" (your messages) and "wa.db.crypt15" (your contact names) to this computer.`}</li>
  </ol>
</vbox>

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

<style>
  .instructions {
    display: block;
    margin-block-start: 8px;
  }
  li {
    margin-block-end: 8px;
    line-height: 1.4;
  }
</style>
