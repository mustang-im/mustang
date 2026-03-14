{#if isExpanded}
  {#if signed || encrypted}
    <vbox>
      <hbox class="signed key-{trustLevel} plain" on:click={() => isExpanded = false}>
        <RoundButton
          label={msg}
          icon={encrypted && signed ? EncryptedIcon : signed ? SignedIcon : EncryptedUnsignedIcon}
          iconSize="16px"
          padding="3px"
          border={false}
          />
        <div>{msg}</div>
      </hbox>
    </vbox>
  {/if}

  <EncryptionKey short showIcon={false}
    key={getPublicKeyForID($message.signed)}
    person={$message.from.findPerson()}
    bind:isExpanded={isExpanded} />
{/if}

<script lang="ts">
  import type { EMail } from "../../../logic/Mail/EMail";
  import { TrustLevel } from "../../../logic/Mail/Encryption/PublicKey";
  import { getPublicKeyForID } from "../../../logic/Mail/Encryption/KeyUtils";
  import EncryptionKey from "../../Contacts/PersonPage/EncryptionKey.svelte";
  import RoundButton from "../../Shared/RoundButton.svelte";
  import SignedIcon from "lucide-svelte/icons/signature";
  import EncryptedIcon from "lucide-svelte/icons/lock";
  import EncryptedUnsignedIcon from "lucide-svelte/icons/shield-question-mark";
  import { t } from "../../../l10n/l10n";

  export let message: EMail;
  /** out */
  export let isExpanded = false;

  // TODO Fake for testing
  $: message.signed = message.from?.findPerson()?.encryptionPublicKeys.first?.id;
  $: message.wasEncrypted = true;

  $: signingKey = getPublicKeyForID($message.signed);
  $: signed = $message.signed && $signingKey.trustLevel != TrustLevel.Distrusted;
  $: encrypted = $message.wasEncrypted && $signingKey.trustLevel != TrustLevel.Distrusted;
  $: trustLevel = $signingKey?.trustLevel == TrustLevel.Distrusted ? "none" : $signingKey?.trustLevel ?? "none";
  $: msg = signed && encrypted
      ? $t`This message was end-to-end-encrypted to you, and signed by ${$message.from?.nameOrEMail}. If - and only if - you have confidence in the certificate below, that means that this email was indeed written by ${$message.from?.nameOrEMail},
      and only the recipients can read it.`
      : signed
        ? $t`This message was signed by ${$message.from?.nameOrEMail}. If - and only if - you have confidence in the certificate below, that means that this email was indeed written by ${$message.from?.nameOrEMail}. It was not encrypted, meaning that it was not protected from surveillance.`
        : $t`This message was end-to-end-encrypted, but not signed. Only the recipients can read it, but there is no assurance about who wrote it.`;
</script>

<style>
  .signed {
    align-items: start;
    margin-inline-start: 8px;
    margin-block-start: 3px;

    background-color: var(--main-pattern-bg);
    color: var(--main-pattern-fg);
    border-radius: 2px;
    box-shadow: 1px 1px 1px 0px rgba(0, 0, 0, 15%);
    margin: 4px 0px;
    padding: 10px 8px;
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
  }
  .signed.key-personal :global(.button) {
    background-color: green;
    color: white;
  }
  .signed.key-third-party :global(.button) {
    background-color: blue;
    color: white;
  }
  .signed div {
    margin-inline-start: 16px;
  }
</style>
