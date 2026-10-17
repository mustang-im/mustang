{#if isSigned || isEncrypted}
  <hbox class="security-bar" class:verified={isSigned}>
    <svelte:component this={isEncrypted && isSigned ? EncryptedIcon : isSigned ? SignedIcon : EncryptedUnsignedIcon} size={16} />
    <span class="text">
      {#if isSigned}
        {isEncrypted ? $t`Encrypted. Signed by: ${$message.from?.emailAddress ?? ""}` : $t`Signed by: ${$message.from?.emailAddress ?? ""}`}
      {:else}
        {$t`Encrypted, but not signed`}
      {/if}
    </span>
    <button class="link" on:click={() => { isDetailsOpen = true; }}>{$t`Details…`}</button>
  </hbox>
{/if}
{#if isDetailsOpen}
  <EncryptionDetails {message} {signingKey} on:close={() => { isDetailsOpen = false; }} />
{/if}

<script lang="ts">
  import type { EMail } from "../../../logic/Mail/EMail";
  import type { PublicKey } from "../../../logic/Mail/Encryption/PublicKey";
  import { getPublicKeyByKeyID } from "../../../logic/Mail/Encryption/KeyUtils";
  import { MessageSecurity } from "../ReadingPane/MessageSecurity";
  import EncryptionDetails from "./EncryptionDetails.svelte";
  import SignedIcon from "lucide-svelte/icons/signature";
  import EncryptedIcon from "lucide-svelte/icons/lock";
  import EncryptedUnsignedIcon from "lucide-svelte/icons/shield-question-mark";
  import { showError } from "../../../frontend/Util/error";
  import { t } from "../../../l10n/l10n";

  export let message: EMail;

  let signingKey: PublicKey = null;
  let isDetailsOpen = false;
  // <copied from="../../../frontend/Mail/Message/EncryptionButtons.svelte">
  $: getPublicKeyByKeyID($message.signedByKeyID, message)
    .then(key => signingKey = key)
    .catch(showError);
  // </copied>
  $: isSigned = $message && MessageSecurity.isSigned(message, signingKey);
  $: isEncrypted = !!$message.wasEncrypted;
</script>

<style>
  .security-bar {
    align-items: center;
    flex-shrink: 0;
    gap: 8px;
    margin: 0 20px 6px 20px;
    padding: 6px 12px;
    border-radius: var(--lo-radius-small);
    background-color: var(--lo-pane-alt-bg);
    border: 1px solid var(--lo-divider);
    color: var(--lo-fg);
    font-size: 13px;
  }
  .security-bar :global(svg) {
    flex-shrink: 0;
    color: var(--lo-fg-secondary);
  }
  .security-bar.verified :global(svg) {
    color: var(--lo-accent-text);
  }
  .text {
    min-width: 0;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .link {
    flex-shrink: 0;
    padding: 0;
    border: none;
    background: none;
    color: var(--lo-accent-text);
    font: inherit;
    cursor: pointer;
  }
  .link:hover {
    text-decoration: underline;
  }
</style>
