{#if $privateKeys.hasItems}
  <hbox class="encryption buttons"
    class:encrypt={mail.shouldEncrypt}
    style="--trustColor: {trustColor[trustLevel]}; --trustColorFG: {trustColorFG[trustLevel]}">
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
  import { trustColor, trustColorFG, TrustLevel, trustOrder, type PublicKey } from "../../../logic/Mail/Encryption/PublicKey";
  import ButtonMenu from "../../Shared/Menu/ButtonMenu.svelte";
  import MenuItem from "../../Shared/Menu/MenuItem.svelte";
  import RoundButton from "../../Shared/RoundButton.svelte";
  import SignIcon from "lucide-svelte/icons/signature";
  import EncryptIcon from "lucide-svelte/icons/lock";
  import NoEncryptIcon from "lucide-svelte/icons/lock-open";
  import NoneIcon from "lucide-svelte/icons/circle-off";
  import { openSettingsCategoryForAccount } from "../../Settings/Window/CategoriesUtils";
  import { every } from "../../../logic/util/collections";
  import { showError } from "../../Util/error";
  import { assert, UserError } from "../../../logic/util/util";
  import { t, gt } from "../../../l10n/l10n";
  import type { Collection } from "svelte-collections";

  export let mail: EMail;
  export let identity: MailIdentity;

  $: privateKeys = identity.encryptionPrivateKeys;
  $: signDisabledReason = $privateKeys.hasItems && getMyPrivateKey(identity) ? null : gt`No secret keys enabled for signing`;
  $: to = mail.to;
  $: cc = mail.cc;
  $: allRecipients = $to.concat($cc);
  $: allRecipientsKeys = $allRecipients.map(p => getPublicKeyForPerson(p.findPerson())).filterOnce(Boolean);
  $: trustLevel = mail.shouldEncrypt ? lowestTrust($allRecipientsKeys) : TrustLevel.Personal;
  $: encryptDisabledReason =
    $mail.mustEncrypt
    ? gt`Policy requires that this email stays encrypted, to keep protect secret information`
    : $allRecipients.hasItems && ($allRecipientsKeys.isEmpty || $allRecipients.find(puid => !getPublicKeyForPerson(puid.findPerson())))
      ? gt`One of the recipients is lacking the certificate for encryption`
      : null;

  let isMenuOpen = false;

  function toggleSigned() {
    if (mail.mustEncrypt) {
      return;
    }
    if (mail.signed && mail.shouldEncrypt) {
      mail.shouldEncrypt = false;
    } else if (mail.signed) {
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

  function lowestTrust(keys: Collection<PublicKey>): TrustLevel {
    return allTrust(keys, TrustLevel.Personal)
      || allTrust(keys, TrustLevel.ThirdParty)
      || allTrust(keys, TrustLevel.Sender)
      || TrustLevel.Distrusted;
  }
  function allTrust(keys: Collection<PublicKey>, trustLevel: TrustLevel): TrustLevel | false {
    let needLevel = trustOrder(trustLevel);
    return every(keys, key => trustOrder(key.trustLevel) >= needLevel) ? trustLevel : false;
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
  .buttons.encrypt :global(.button) {
    background-color: var(--trustColor);
    color: var(--trustColorFG);
    border-radius: 1000px;
  }
</style>
