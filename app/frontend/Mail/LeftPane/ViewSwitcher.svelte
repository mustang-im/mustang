<hbox class="switcher">
  <IslandSwitcher {large}>
    <Button
      label={$t`Chat-like mail view`}
      icon={ChatIcon}
      iconOnly={!large}
      iconSize="16px"
      onClick={() => switchTo('chat')}
      selected={view == "chat"}
      />
    <Button
      label={$t`Vertical view`}
      icon={VerticalIcon}
      classes="vertical"
      iconOnly={!large}
      iconSize="16px"
      onClick={() => switchTo('vertical')}
      selected={view == "vertical"}
      />
    <Button
      label={$t`Classic 3-pane view`}
      icon={ThreePaneIcon}
      iconOnly={!large}
      iconSize="16px"
      onClick={() => switchTo('3pane')}
      selected={view == "3pane"}
      />
    <Button
      label={$t`Wide table view`}
      icon={WideTableIcon}
      iconOnly={!large}
      iconSize="16px"
      onClick={() => switchTo('widetable')}
      selected={view == "widetable"}
      />
  </IslandSwitcher>
</hbox>

<script lang="ts">
  import { getLocalStorage } from "../../Util/LocalStorage";
  import IslandSwitcher from "../../Shared/IslandSwitcher.svelte";
  import Button from "../../Shared/Button.svelte";
  import ChatIcon from "lucide-svelte/icons/message-square";
  import VerticalIcon from "lucide-svelte/icons/columns-3";
  import ThreePaneIcon from "lucide-svelte/icons/layout-panel-left";
  import WideTableIcon from "lucide-svelte/icons/columns-4";
  import { t } from "../../../l10n/l10n";

  export let large = false;

  let viewSetting = getLocalStorage("mail.view", "vertical");
  $: view = $viewSetting.value;

  function switchTo(newView: string) {
    viewSetting.value = newView;
  }
</script>

<style>
  .switcher {
    margin: 6px 8px;
  }
</style>
