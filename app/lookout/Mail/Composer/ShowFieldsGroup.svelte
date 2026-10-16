<RibbonGroup label={$t`Show Fields`}>
  <RibbonToggleButton label={$t`Bcc`} icon={BccIcon}
    tooltip={$t`Show the Bcc field`}
    checked={$showBcc.value || bccLocked}
    disabled={bccLocked && $t`Remove the Bcc recipients first`}
    onChange={checked => { $showBcc.value = checked; }} />
  <RibbonToggleButton label={$t`From`} icon={FromIcon}
    tooltip={$t`Show the From field`}
    disabled={!canShowFrom && $t`You have only one sender identity`}
    bind:checked={$showFrom.value} />
</RibbonGroup>

<script lang="ts">
  import { ComposerSettings } from "./ComposerSettings";
  import RibbonGroup from "../../Shared/Ribbon/RibbonGroup.svelte";
  import RibbonToggleButton from "../../Shared/Ribbon/RibbonToggleButton.svelte";
  import BccIcon from "lucide-svelte/icons/eye-off";
  import FromIcon from "lucide-svelte/icons/user-round";
  import { t } from "../../../l10n/l10n";

  export let canShowFrom = false;
  export let bccLocked = false;

  const showBcc = ComposerSettings.showBcc;
  const showFrom = ComposerSettings.showFrom;
</script>
