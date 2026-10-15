<vbox flex class="people-page">
  <Ribbon>
    <RibbonTab label={$t`Home`}>
      <RibbonGroup label={$t`New`}>
        <RibbonButton label={$t`New Contact`} icon={NewContactIcon} disabled={$t`Coming soon`} />
      </RibbonGroup>
    </RibbonTab>
  </Ribbon>
  <vbox flex class="coming lo-card">
    {$t`People is coming soon`}
  </vbox>
</vbox>

<script lang="ts">
  import Ribbon from "../Shared/Ribbon/Ribbon.svelte";
  import RibbonTab from "../Shared/Ribbon/RibbonTab.svelte";
  import RibbonGroup from "../Shared/Ribbon/RibbonGroup.svelte";
  import RibbonButton from "../Shared/Ribbon/RibbonButton.svelte";
  import NewContactIcon from "lucide-svelte/icons/user-plus";
  import { t } from "../../l10n/l10n";
</script>

<style>
  .people-page {
    min-height: 0;
  }
  .coming {
    margin: 0 8px 8px 8px;
    align-items: center;
    justify-content: center;
    color: var(--lo-fg-secondary);
  }
</style>
