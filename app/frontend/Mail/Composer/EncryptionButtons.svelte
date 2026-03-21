{#if $privateKeys.hasItems}
  <hbox class="encryption buttons">
    <ButtonMenu bind:isMenuOpen>
      <RoundButton
        label={$t`Sign or encrypt`}
        tooltip={signDisabledReason ?? encryptDisabledReason ?? mail.shouldEncrypt ? $t`Encrypt and sign` : mail.signed ? $t`Sign digitally` : $t`Sign or encrypt`}
        icon={mail.shouldEncrypt ? EncryptIcon : mail.signed ? SignIcon : NoEncryptIcon}
        selected={!!mail.signed || mail.shouldEncrypt}
        onClick={event => { isMenuOpen = !isMenuOpen; event.stopPropagation(); }}
        disabled={mail.mustEncrypt || !!signDisabledReason && !!encryptDisabledReason}
        classes="plain"
        border={false}
        iconSize="16px"
        padding="4px"
        tabindex={2}
        slot="control"
        />
      <MenuItem
        label={$t`Don't encrypt nor sign`}
        icon={NoneIcon}
        selected={!mail.signed && !mail.shouldEncrypt}
        onClick={onDisableBoth}
        classes="nothing"
        iconSize="16px"
        tabindex={2}
        />
      <MenuItem
        label={$t`Sign digitally`}
        tooltip={signDisabledReason ?? $t`This proves that I wrote this email`}
        icon={SignIcon}
        selected={!!mail.signed}
        onClick={toggleSigned}
        disabled={!!signDisabledReason}
        classes="sign"
        iconSize="16px"
        tabindex={2}
        />
      <MenuItem
        label={$t`Encrypt`}
        tooltip={encryptDisabledReason ?? $t`This ensures that only the recipients can read the email`}
        icon={EncryptIcon}
        selected={mail.shouldEncrypt}
        onClick={toggleEncrypted}
        disabled={!!encryptDisabledReason}
        classes="encrypt"
        iconSize="16px"
        tabindex={2}
        />
    </ButtonMenu>
  </hbox>
{/if}

<script lang="ts">
  import type { EMail } from "../../../logic/Mail/EMail";
  import { MailIdentity } from "../../../logic/Mail/MailIdentity";
  import { getMyPrivateKey, getPublicKeyForPerson } from "../../../logic/Mail/Encryption/KeyUtils";
  import ButtonMenu from "../../Shared/Menu/ButtonMenu.svelte";
  import MenuItem from "../../Shared/Menu/MenuItem.svelte";
  import RoundButton from "../../Shared/RoundButton.svelte";
  import SignIcon from "lucide-svelte/icons/signature";
  import EncryptIcon from "lucide-svelte/icons/lock";
  import NoEncryptIcon from "lucide-svelte/icons/lock-open";
  import NoneIcon from "lucide-svelte/icons/circle-off";
  import { t, gt } from "../../../l10n/l10n";
  import { openSettingsCategoryForAccount } from "../../Settings/Window/CategoriesUtils";
  import { showError } from "../../Util/error";
  import { assert, UserError } from "../../../logic/util/util";
  import { mergeColls } from "svelte-collections";

  export let mail: EMail;
  export let identity: MailIdentity;

  $: privateKeys = identity.encryptionPrivateKeys;
  $: signDisabledReason = $privateKeys.hasItems && getMyPrivateKey(identity)?.id ? null : gt`No secret keys enabled for signing`;
  $: allRecipients = mail.to.concat(mail.cc);
  $: allRecipientsKeys = mergeColls($allRecipients.map(p => p.findPerson()?.encryptionPublicKeys));
  $: encryptDisabledReason =
    $mail.mustEncrypt
    ? gt`Policy requires that this email stays encrypted, to keep protect secret information`
    : $allRecipients.hasItems && ($allRecipientsKeys.isEmpty || $mail.allRecipients().find(puid => !getPublicKeyForPerson(puid.findPerson())))
      ? gt`One of the recipients is lacking the certificate for encryption`
      : null;

  let isMenuOpen = false;

  function toggleSigned() {
    if (mail.mustEncrypt) {
      return;
    }
    if (mail.signed) {
      mail.signed = null;
      mail.shouldEncrypt = false;
    } else {
      doSign();
    }
  }
  function doSign() {
    if (signDisabledReason) {
      openSettingsCategoryForAccount(identity.account, "mail-identity");
      return;
    }
    mail.signed = getMyPrivateKey(identity)?.id;
    assert(mail.signed, "No signing key found");
  }
  function toggleEncrypted() {
    if (mail.mustEncrypt) {
      return;
    }
    if (!mail.shouldEncrypt && encryptDisabledReason) {
      showError(new UserError(encryptDisabledReason)); // TODO open UI to fix the reason
      return;
    }

    mail.shouldEncrypt = !mail.shouldEncrypt;
    if (mail.shouldEncrypt && !mail.signed) {
      doSign();
    }
  }
  function onDisableBoth() {
    if (mail.mustEncrypt) {
      return;
    }
    mail.signed = null;
    mail.shouldEncrypt = false;
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
