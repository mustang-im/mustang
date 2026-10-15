<vbox flex class="calendar-page">
  <Ribbon>
    <RibbonTab label={$t`Home`}>
      <RibbonGroup label={$t`New`}>
        <RibbonButton label={$t`New Appointment`} icon={NewEventIcon} disabled={$t`Coming soon`} />
      </RibbonGroup>
      <RibbonGroup label={$t`Go To`}>
        <RibbonButton label={$t`Today`} icon={TodayIcon} disabled={$t`Coming soon`} />
      </RibbonGroup>
    </RibbonTab>
  </Ribbon>
  <vbox flex class="coming lo-card">
    {$t`Calendar is coming soon`}
  </vbox>
</vbox>

<script lang="ts">
  import Ribbon from "../Shared/Ribbon/Ribbon.svelte";
  import RibbonTab from "../Shared/Ribbon/RibbonTab.svelte";
  import RibbonGroup from "../Shared/Ribbon/RibbonGroup.svelte";
  import RibbonButton from "../Shared/Ribbon/RibbonButton.svelte";
  import NewEventIcon from "lucide-svelte/icons/calendar-plus";
  import TodayIcon from "lucide-svelte/icons/calendar-check";
  import { t } from "../../l10n/l10n";
</script>

<style>
  .calendar-page {
    min-height: 0;
  }
  .coming {
    margin: 0 8px 8px 8px;
    align-items: center;
    justify-content: center;
    color: var(--lo-fg-secondary);
  }
</style>
