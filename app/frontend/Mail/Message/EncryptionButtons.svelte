{#if signed || encrypted}
  <hbox class="signed key-{trustLevel} plain">
    <RoundButton
      label={msg}
      icon={encrypted ? EncryptedIcon : SignedIcon}
      onClick={openSigningKey}
      iconSize="12px"
      padding="2px"
      border={false}
      />
  </hbox>
{/if}

<script lang="ts">
  import type { EMail } from "../../../logic/Mail/EMail";
  import { TrustLevel } from "../../../logic/Mail/Encryption/PublicKey";
  import { getPublicKeyForID } from "../../../logic/Mail/Encryption/KeyUtils";
  import RoundButton from "../../Shared/RoundButton.svelte";
  import SignedIcon from "lucide-svelte/icons/signature";
  import EncryptedIcon from "lucide-svelte/icons/lock";
  import { t } from "../../../l10n/l10n";

  export let message: EMail;
  /** out */
  export let isExpanded = false;

  // TODO Fake for testing
  $: message.signed = message.from?.findPerson()?.encryptionPublicKeys.first?.id;
  $: message.wasEncrypted = true;

  $: signingKey = getPublicKeyForID($message.signed);
  $: signed = $message.signed && $signingKey.trustLevel != TrustLevel.Distrusted;
  $: encrypted = $message.wasEncrypted;
  $: trustLevel = $signingKey?.trustLevel == TrustLevel.Distrusted ? "none" : $signingKey?.trustLevel ?? "none";
  $: keyName = $signingKey?.name ?? $message.signed?.substring(2, 6);
  $: msg = signed && encrypted
      ? $t`This message was end-to-end-encrypted to you, and signed by ${$message.from?.name ?? $t`somebody`} with ${signingKey?.system} key ${keyName}`
      : signed
        ? $t`This message was signed with ${signingKey?.system} key ${keyName}`
        : $t`This message was end-to-end-encrypted, but not signed`;

  function openSigningKey() {
    isExpanded = !isExpanded;
  }

  /*function openSigningKeyPerson() {
    let person = message.from?.findPerson();
    if (!person) {
      return;
    }
    openPersonFromOtherApp(person);
  }*/
</script>

<style>
  .signed {
    align-items: start;
    margin-inline-start: 8px;
    margin-block-start: 3px;
  }
  .signed :global(.button) {
    border-radius: var(--border-radius);
  }
  .signed.key-none :global(.button) {
    display: none;
  }
  .signed.key-sender :global(.button) {
    background-color: yellow;
    color: black;
  }
  .signed.key-third-party :global(.button) {
    background-color: blue;
    color: white;
    stroke-width: 3px;
  }
  .signed.key-personal :global(.button) {
    background-color: green;
    color: white;
  }
  .signed.key-third-party :global(.button) {
    background-color: blue;
    color: white;
  }
  .signed.signed.key-third-party :global(.button svg),
  .signed.key-personal :global(.button svg) {
    stroke-width: 3px;
  }
</style>
