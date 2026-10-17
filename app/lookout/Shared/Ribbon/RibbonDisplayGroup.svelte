<RibbonGroup label={$t`Ribbon`}>
  <RibbonToggleButton label={$t`Simplified Ribbon`} shortLabel={$t`Simplified`} icon={SimplifiedIcon}
    tooltip={$t`Show the commands in one row`}
    checked={$layout.value == "simplified"}
    onChange={checked => ribbon.setLayout(checked ? "simplified" : "classic")} />
  <RibbonToggleButton label={$t`Show Tabs Only`} icon={TabsOnlyIcon} size="small"
    tooltip={$t`Show only the tab names. Click a tab to see its commands.`}
    shortCutInfo="Ctrl+F1"
    checked={!!$collapsed.value}
    onChange={checked => ribbon.setCollapsed(checked)} />
  <RibbonToggleButton label={$t`Quick Access Toolbar`} icon={QuickAccessIcon} size="small"
    tooltip={$t`Show the Quick Access Toolbar`}
    checked={!$qatHidden.value}
    onChange={checked => { $qatHidden.value = !checked; }} />
  <RibbonButton label={$t`Customize Ribbon…`} icon={CustomizeIcon} size="small"
    tooltip={$t`Choose which tabs and groups the ribbon shows`}
    onClick={() => ribbon.isCustomizing.set(true)} />
</RibbonGroup>

<script lang="ts">
  import { RibbonModel } from "./RibbonGroup";
  import { getLocalStorage } from "../../../frontend/Util/LocalStorage";
  import RibbonGroup from "./RibbonGroup.svelte";
  import RibbonButton from "./RibbonButton.svelte";
  import RibbonToggleButton from "./RibbonToggleButton.svelte";
  import SimplifiedIcon from "lucide-svelte/icons/panel-top";
  import TabsOnlyIcon from "lucide-svelte/icons/panel-top-close";
  import QuickAccessIcon from "lucide-svelte/icons/app-window";
  import CustomizeIcon from "lucide-svelte/icons/settings-2";
  import { getContext } from "svelte";
  import { t } from "../../../l10n/l10n";

  const ribbon = getContext<RibbonModel>(RibbonModel.contextKey);
  const layout = ribbon.layout;
  const collapsed = ribbon.collapsed;
  const qatHidden = getLocalStorage<boolean>("lookout.qat.hidden", false);
</script>
