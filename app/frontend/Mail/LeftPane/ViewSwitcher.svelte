<hbox class="buttons">
  <Button
    label={$t`Chat-like mail view`}
    icon={ChatIcon}
    iconOnly
    iconSize="16px"
    plain
    onClick={() => switchTo('chat')}
    selected={view == "chat"}
    />
  <Button
    label={$t`Vertical view`}
    icon={VerticalIcon}
    classes="vertical"
    iconOnly
    iconSize="16px"
    plain
    onClick={() => switchTo('vertical')}
    selected={view == "vertical"}
    />
  <Button
    label={$t`Classic 3-pane view`}
    icon={ThreePaneIcon}
    iconOnly
    iconSize="16px"
    plain
    onClick={() => switchTo('3pane')}
    selected={view == "3pane"}
    />
</hbox>

<script lang="ts">
  import { getLocalStorage } from "../../Util/LocalStorage";
  import Button from "../../Shared/Button.svelte";
  import ChatIcon from "lucide-svelte/icons/message-square";
  //import VerticalIcon from "lucide-svelte/icons/columns";
  import VerticalIcon from '../../asset/icon/mail/threeColumns.svg?raw';
  import ThreePaneIcon from "lucide-svelte/icons/layout-panel-left";
  import { t } from "../../../l10n/l10n";

  let viewSetting = getLocalStorage("mail.view", "vertical");
  $: view = $viewSetting.value;

  function switchTo(newView: string) {
    viewSetting.value = newView;
  }
</script>

<style>
  .buttons :global(button) {
    padding: 4px;
  }
  .buttons :global(.vertical) {
    color: transparent;
  }
  .buttons :global(svg) {
    fill: transparent;
  }
</style>
