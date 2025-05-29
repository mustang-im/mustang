<hbox class="switcher">
  <IslandSwitcher {large}>
    <Button
      label={$t`Table view`}
      icon={TableIcon}
      iconOnly={!large}
      iconSize="16px"
      onClick={() => switchTo("table")}
      selected={view == "table"}
      />
    <Button
      label={$t`Vertical view`}
      icon={GalleryIcon}
      iconOnly={!large}
      iconSize="16px"
      onClick={() => switchTo("gallery")}
      selected={view == "gallery"}
      />
  </IslandSwitcher>
</hbox>

<script lang="ts">
  import { getLocalStorage } from "../Util/LocalStorage";
  import IslandSwitcher from "../Shared/IslandSwitcher.svelte";
  import Button from "../Shared/Button.svelte";
  import TableIcon from "lucide-svelte/icons/table-of-contents";
  import GalleryIcon from "lucide-svelte/icons/grid-3x3";
  import { t } from "../../l10n/l10n";

  export let large = false;

  let viewSetting = getLocalStorage("files.view", "table");
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
