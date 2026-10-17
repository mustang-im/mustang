<Dialog title={$t`Message Security Properties`} cancelLabel={$t`Close`} width="560px" on:close>
  <vbox class="security">
    <FormGrid columns="max-content minmax(0, 1fr)">
      <span class="lo-form-label">{$t`Subject:`}</span>
      <span class="value">{$message.subject ?? ""}</span>
    </FormGrid>
    <span>{$t`Messages may contain encryption and digital signature layers. Each digital signature layer may contain multiple signatures.`}</span>
    <span class="caption">{$t`Security Layers`}</span>
    <ListView items={layers} bind:selected={selectedLayer} label={$t`Security Layers`} height="96px" let:item>
      <hbox class="layer">
        <svelte:component this={item.icon} size={16} />
        <span>{item.label}</span>
      </hbox>
    </ListView>
    <span class="caption">{$t`Description:`}</span>
    <div class="description">
      <div class="description-title">{MessageSecurity.title(isSigned, isEncrypted)}</div>
      <div>{MessageSecurity.description(isSigned, isEncrypted, !!mySigningKey, fromName)}</div>
    </div>
    {#if signingKey && !mySigningKey}
      <GroupBox label={$t`Signing key`}>
        <FormGrid columns="max-content minmax(0, 1fr)">
          <span class="lo-form-label">{$t`Signer:`}</span>
          <span class="value">{$signingKey.name ?? fromName}</span>
          <span class="lo-form-label">{$t`System:`}</span>
          <span class="value">{signingKey.system}</span>
          <span class="lo-form-label">{$t`Fingerprint:`}</span>
          <span class="value fingerprint">{signingKey.fingerprintDisplay}</span>
          <span class="lo-form-label">{$t`Valid from:`}</span>
          <span class="value">{signingKey.created ? getDateString(signingKey.created) : "–"}</span>
          <span class="lo-form-label">{$t`Valid to:`}</span>
          <span class="value">{signingKey.expires ? getDateString(signingKey.expires) : "–"}</span>
        </FormGrid>
      </GroupBox>
      <GroupBox label={$t`Edit Trust`}>
        {#each MessageSecurity.trustChoices(signingKey) as level}
          <Radio label={MessageSecurity.trustLabel(level, signingKey.caName, fromName)}
            bind:group={signingKey.trustLevel} value={level}
            onChange={onTrustChanged} />
        {/each}
      </GroupBox>
    {/if}
  </vbox>
</Dialog>

<script lang="ts">
  import type { EMail } from "../../../logic/Mail/EMail";
  import type { PublicKey } from "../../../logic/Mail/Encryption/PublicKey";
  import { findIdentityForEMailAddress } from "../../../logic/Mail/MailIdentity";
  import { MessageSecurity } from "../ReadingPane/MessageSecurity";
  import Dialog from "../../Shared/Dialog/Dialog.svelte";
  import FormGrid from "../../Shared/Form/FormGrid.svelte";
  import GroupBox from "../../Shared/Form/GroupBox.svelte";
  import ListView from "../../Shared/Form/ListView.svelte";
  import Radio from "../../Shared/Form/Radio.svelte";
  import SignedIcon from "lucide-svelte/icons/signature";
  import EncryptedIcon from "lucide-svelte/icons/lock";
  import SubjectIcon from "lucide-svelte/icons/mail";
  import { getDateString } from "../../../frontend/Util/date";
  import { gt, t } from "../../../l10n/l10n";

  export let message: EMail;
  export let signingKey: PublicKey | null;

  $: isSigned = MessageSecurity.isSigned(message, signingKey);
  $: isEncrypted = !!$message.wasEncrypted;
  // <copied from="../../../frontend/Mail/Message/EncryptionDetails.svelte">
  $: identity = $message.outgoing ? findIdentityForEMailAddress($message.from?.emailAddress) : null;
  $: mySigningKey = identity?.encryptionPrivateKeys.find(key => key.id == message.signedByKeyID);
  $: fromName = $message.from?.findPerson()?.name ?? $message.from?.nameOrEMail;
  // </copied>
  $: layers = [
    { label: gt`Subject: ${message.subject ?? ""}`, icon: SubjectIcon },
    ...(isEncrypted ? [{ label: gt`Encryption Layer`, icon: EncryptedIcon }] : []),
    ...(isSigned ? [{ label: gt`Digital Signature Layer`, icon: SignedIcon }] : []),
  ];
  let selectedLayer = null;

  async function onTrustChanged() {
    // <copied from="../../../frontend/Contacts/PersonPage/EncryptionKey.svelte" onSave()>
    await message.from?.findPerson()?.save();
    // </copied>
  }
</script>

<style>
  .security {
    gap: 8px;
  }
  .caption {
    font-weight: 600;
    margin-top: 4px;
  }
  .layer {
    align-items: center;
    gap: 8px;
  }
  .layer :global(svg) {
    flex-shrink: 0;
    color: var(--lo-accent-text);
  }
  .description {
    padding: 8px;
    border: 1px solid var(--lo-input-border);
    border-radius: var(--lo-radius-small);
    background-color: var(--lo-input-bg);
    line-height: 1.4;
  }
  .description-title {
    font-weight: 600;
    margin-bottom: 4px;
  }
  .value {
    min-width: 0;
    overflow-wrap: anywhere;
  }
  .fingerprint {
    font-family: monospace;
  }
</style>
