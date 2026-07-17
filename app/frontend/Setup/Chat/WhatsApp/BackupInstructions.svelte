<!-- How to create + copy off an encrypted WhatsApp backup. Shared by the setup
  wizard (ExportInstructions) and the account-settings import dialog, so the steps
  (and, later, a screenshot) stay in one place. -->
<vbox class="instructions">
  <ol>
    <li>{$t`Open WhatsApp on your phone`}</li>
    <li>{@html $t`Tap the menu <span class="mock-button">⋮</span>, <span class="mock-button">Settings</span>, <span class="mock-button">Chats</span>, <span class="mock-button">Chat backup</span>`}</li>
    <li>{@html $t`Tap <span class="mock-button">End-to-end encrypted backup</span>, then <span class="mock-button">Turn on</span>`}</li>
    <li>{@html $t`Choose <span class="mock-button">Use 64-digit encryption key instead</span>, then <span class="mock-button">Generate your 64-digit key</span>. Do not use the password method.`}</li>
    <li>{$t`Write down or save the 64-digit key. You will enter it in the next step. WhatsApp will not show it again`}</li>
    <li>{@html $t`Tap <span class="mock-button">Create</span> to finish, then tap <span class="mock-button">Back up</span> and wait until the backup is complete`}</li>
    <li>{$t`Connect your phone to this computer with a USB cable, and allow file transfer on the phone`}</li>
    <li>{@html $t`From the phone folder <span class="mock-button">Android/media/com.whatsapp/WhatsApp/Databases/</span>, copy the files <span class="mock-button">msgstore.db.crypt15</span> (your messages) and <span class="mock-button">wa.db.crypt15</span> (your contact names) to this computer`}</li>
  </ol>
</vbox>

<script lang="ts">
  import { t } from "../../../../l10n/l10n";
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
  .instructions :global(.mock-button) {
    display: inline-block;
    border: 1px solid var(--border);
    padding: 0px 4px;
    margin: 2px 0px;
  }
</style>
