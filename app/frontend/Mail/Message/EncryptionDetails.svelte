{#if isExpanded}
  <vbox class="font-small">
    {#if signed || encrypted}
      <vbox class="signed key-{trustLevel} plain">
        <hbox on:click={() => isExpanded = false}>
          <RoundButton
            label={title}
            icon={encrypted && signed ? EncryptedIcon : signed ? SignedIcon : EncryptedUnsignedIcon}
            iconSize="16px"
            padding="3px"
            border={false}
            />
          <div class="title">{title}</div>
        </hbox>
        <div class="msg">{msg}</div>
      </vbox>
    {/if}

    {#if signingKey}
      <EncryptionKey short showIcon={false}
        key={signingKey}
        personUID={$message.from}
        bind:isExpanded={isExpanded} />
    {/if}
  </vbox>
{/if}

<script lang="ts">
  import type { EMail } from "../../../logic/Mail/EMail";
  import { TrustLevel } from "../../../logic/Mail/Encryption/PublicKey";
  import { getPublicKeyByKeyID } from "../../../logic/Mail/Encryption/KeyUtils";
  import EncryptionKey from "../../Contacts/PersonPage/EncryptionKey.svelte";
  import RoundButton from "../../Shared/RoundButton.svelte";
  import SignedIcon from "lucide-svelte/icons/signature";
  import EncryptedIcon from "lucide-svelte/icons/lock";
  import EncryptedUnsignedIcon from "lucide-svelte/icons/shield-question-mark";
  import { t } from "../../../l10n/l10n";
    import { appGlobal } from "../../../logic/app";

  export let message: EMail;
  /** out */
  export let isExpanded = false;

  $: signingKey = getPublicKeyByKeyID($message.signed);
  $: signed = $message.signed && $signingKey?.trustLevel != TrustLevel.Distrusted;
  $: encrypted = $message.wasEncrypted;
  $: trustLevel = $signingKey?.trustLevel == TrustLevel.Distrusted ? "none" : $signingKey?.trustLevel ?? "none";
  $: title = signed && encrypted
      ? $t`End-to-end encrypted and signed`
      : signed
        ? $t`Signed`
        : $t`End-to-end-encrypted, but not signed`;
  $: fromName = $message.from?.findPerson()?.name ?? $message.from?.nameOrEMail;
  $: msg = signed && encrypted
      ? $t`If - and only if - you have confidence in the certificate below, you can be sure that this email was indeed written by ${fromName}. Only the recipients can read it, but the email provider cannot.`
      : signed
        ? $t`If - and only if - you have confidence in the certificate below, you can be sure that this email was indeed written by ${fromName}. It was not encrypted, meaning that it was not protected from surveillance.`
        : $t`Only the recipients can read this email, but there is no assurance about who wrote it.`;
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
    /*background-color: red;
    color: white;*/
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
  .signed .title {
    margin-inline-start: 16px;
    margin-block-start: 1px;
    font-weight: bold;
    justify-self: baseline;
  }
  .signed .msg {
    margin-block-start: 8px;
    margin-inline-start: 4px;
  }
</style>
