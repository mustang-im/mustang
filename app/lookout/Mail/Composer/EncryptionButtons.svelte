<RibbonGroup label={$t`Encrypt`}>
  {#if privateKey}
    <RibbonToggleButton label={$t`Encrypt`} icon={EncryptIcon}
      tooltip={$t`Only the recipients can read the email`}
      checked={!!$mail.shouldEncrypt}
      disabled={$mail.mustEncrypt && $t`Policy requires that this email stays encrypted, to keep protect secret information`}
      onChange={() => ComposerEncryption.toggleEncrypted(mail, identity)} />
    <RibbonToggleButton label={$t`Sign`} icon={SignIcon}
      tooltip={$t`This proves that I wrote this email`}
      checked={!!$mail.signedByKeyID}
      disabled={$mail.mustEncrypt && $t`Policy requires that this email stays encrypted, to keep protect secret information`}
      onChange={() => ComposerEncryption.toggleSigned(mail, identity)} />
  {:else}
    <RibbonButton label={$t`Encrypt`} icon={EncryptIcon}
      tooltip={$t`You need a digital ID to encrypt messages. Set it up in the Trust Center.`}
      onClick={() => SettingsDialogs.openTrustCenter(identity)} />
    <RibbonButton label={$t`Sign`} icon={SignIcon}
      tooltip={$t`You need a digital ID to sign messages. Set it up in the Trust Center.`}
      onClick={() => SettingsDialogs.openTrustCenter(identity)} />
  {/if}
</RibbonGroup>

<script lang="ts">
  import type { EMail } from "../../../logic/Mail/EMail";
  import type { MailIdentity } from "../../../logic/Mail/MailIdentity";
  import { ComposerEncryption } from "./ComposerEncryption";
  import { getMyPrivateKey } from "../../../logic/Mail/Encryption/KeyUtils";
  import { SettingsDialogs } from "../../Settings/SettingsDialogs";
  import RibbonGroup from "../../Shared/Ribbon/RibbonGroup.svelte";
  import RibbonButton from "../../Shared/Ribbon/RibbonButton.svelte";
  import RibbonToggleButton from "../../Shared/Ribbon/RibbonToggleButton.svelte";
  import EncryptIcon from "lucide-svelte/icons/lock";
  import SignIcon from "lucide-svelte/icons/signature";
  import { t } from "../../../l10n/l10n";

  export let mail: EMail;
  export let identity: MailIdentity;

  $: privateKey = identity ? getMyPrivateKey(identity) ?? null : null;
</script>
