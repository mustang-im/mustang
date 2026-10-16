{#if privateKey}
  <RibbonGroup label={$t`Encrypt`}>
    <RibbonToggleButton label={$t`Encrypt`} icon={EncryptIcon}
      tooltip={$t`Only the recipients can read the email`}
      checked={!!$mail.shouldEncrypt}
      disabled={$mail.mustEncrypt && ComposerEncryption.encryptDisabledReason(mail)}
      onChange={() => ComposerEncryption.toggleEncrypted(mail, identity)} />
    <RibbonToggleButton label={$t`Sign`} icon={SignIcon}
      tooltip={$t`This proves that I wrote this email`}
      checked={!!$mail.signedByKeyID}
      disabled={$mail.mustEncrypt && ComposerEncryption.encryptDisabledReason(mail)}
      onChange={() => ComposerEncryption.toggleSigned(mail, identity)} />
  </RibbonGroup>
{/if}

<script lang="ts">
  import type { EMail } from "../../../logic/Mail/EMail";
  import type { MailIdentity } from "../../../logic/Mail/MailIdentity";
  import { ComposerEncryption } from "./ComposerEncryption";
  import RibbonGroup from "../../Shared/Ribbon/RibbonGroup.svelte";
  import RibbonToggleButton from "../../Shared/Ribbon/RibbonToggleButton.svelte";
  import EncryptIcon from "lucide-svelte/icons/lock";
  import SignIcon from "lucide-svelte/icons/signature";
  import { t } from "../../../l10n/l10n";

  export let mail: EMail;
  export let identity: MailIdentity;

  $: privateKey = ComposerEncryption.privateKey(identity);
</script>
