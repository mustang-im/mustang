<OptionsPage icon={TrustCenterIcon} description={$t`Help keep your messages secure and your computer healthy.`}>
  <OptionsSection title={$t`${appName} Trust Center`}>
    <OptionsRow icon={SecurityIcon}>
      <hbox>{$t`The Trust Center contains security and privacy settings. These settings help keep your computer secure. We recommend that you do not change these settings.`}</hbox>
      <DialogButton slot="button" label={$t`Trust Center Settings…`} onClick={() => { isTrustCenterOpen = true; }} />
    </OptionsRow>
  </OptionsSection>
</OptionsPage>

{#if isTrustCenterOpen}
  <TrustCenterDialog on:close={() => isTrustCenterOpen = false} />
{/if}

<script lang="ts">
  import OptionsPage from "../Shared/OptionsPage.svelte";
  import OptionsSection from "../Shared/OptionsSection.svelte";
  import OptionsRow from "../Shared/OptionsRow.svelte";
  import TrustCenterDialog from "./TrustCenterDialog.svelte";
  import DialogButton from "../../Shared/Dialog/DialogButton.svelte";
  import { appName } from "../../../logic/build";
  import TrustCenterIcon from "lucide-svelte/icons/shield-check";
  import SecurityIcon from "lucide-svelte/icons/shield";
  import { t } from "../../../l10n/l10n";

  let isTrustCenterOpen = false;
</script>
