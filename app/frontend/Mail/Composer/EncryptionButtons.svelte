{#if $privateKeys.hasItems}
  <hbox class="encryption buttons">
    <RoundButton
      label={signDisabledReason ?? $t`Sign digitally`}
      icon={SignIcon}
      selected={!!mail.signed}
      onClick={toggleSigned}
      classes="sign e {signDisabledReason ? "disabled" : "d"} plain"
      border={false}
      iconSize="16px"
      padding="4px"
      tabindex={2}
      />
    <RoundButton
      label={encryptDisabledReason ?? $t`Encrypt`}
      icon={EncryptIcon}
      selected={mail.shouldEncrypt}
      onClick={toggleEncrypted}
      disabled={!!encryptDisabledReason}
      classes="encrypt plain"
      border={false}
      iconSize="16px"
      padding="4px"
      tabindex={2}
      />
  </hbox>
{/if}

<script lang="ts">
  import type { EMail } from "../../../logic/Mail/EMail";
  import { MailIdentity } from "../../../logic/Mail/MailIdentity";
  import { getMyPrivateKey, getPublicKeyForPerson } from "../../../logic/Mail/Encryption/KeyUtils";
  import RoundButton from "../../Shared/RoundButton.svelte";
  import SignIcon from "lucide-svelte/icons/signature";
  import EncryptIcon from "lucide-svelte/icons/lock";
  import { t, gt } from "../../../l10n/l10n";
  import { openSettingsCategoryForAccount } from "../../Settings/Window/CategoriesUtils";
  import { showError } from "../../Util/error";
  import { assert, UserError } from "../../../logic/util/util";

  export let mail: EMail;
  export let identity: MailIdentity;

  $: privateKeys = identity.encryptionPrivateKeys;
  $: signDisabledReason = $privateKeys.hasItems && getMyPrivateKey(identity)?.id ? null : gt`No secret keys enabled for signing`;
  $: encryptDisabledReason =
    $mail.mustEncrypt
    ? gt`Policy requires that this email stays encrypted, to keep protect secret information`
    : $mail.allRecipients().find(puid => !puid.findPerson()?.encryptionPublicKeys.find(key => key.useToEncrypt))
      ? gt`No secret keys enabled for encryption`
      : null;

  function toggleSigned() {
    if (signDisabledReason) {
      openSettingsCategoryForAccount(identity.account, "mail-identity");
      return;
    }
    if (mail.signed) {
      mail.signed = null;
    } else {
      mail.signed = getMyPrivateKey(identity)?.id;
      assert(mail.signed, "No signing key found");
    }
  }
  function toggleEncrypted() {
    if (encryptDisabledReason) {
      showError(new UserError(encryptDisabledReason)); // TODO open UI to fix the reason
      return;
    }
    if (mail.mustEncrypt) {
      return;
    }
    mail.shouldEncrypt = !mail.shouldEncrypt;
  }
</script>

<style>
  .buttons {
    align-items: center;
    margin-inline-start: 4px;
    gap: 4px;
  }
  .buttons  :global(.button:not(.selected)) {
    color: #595065;
  }
  .buttons :global(.disabled) {
    opacity: 60%;
  }
</style>
