<hbox class="buttons" class:large>
  <Button
    label={$t`Chat-like mail view`}
    icon={ChatIcon}
    iconOnly={!large}
    iconSize="16px"
    plain
    onClick={() => switchTo('chat')}
    selected={view == "chat"}
    />
  <Button
    label={$t`Vertical view`}
    icon={VerticalIcon}
    classes="vertical"
    iconOnly={!large}
    iconSize="16px"
    plain
    onClick={() => switchTo('vertical')}
    selected={view == "vertical"}
    />
  <Button
    label={$t`Classic 3-pane view`}
    icon={ThreePaneIcon}
    iconOnly={!large}
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

  export let large = false;

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
  .buttons.large :global(button) {
    padding: 8px;
    margin-right: 12px;
  }
  .buttons :global(.vertical .icon) {
    color: transparent;
  }
  .buttons :global(svg) {
    fill: transparent;
  }
  @media (max-width: 800px)  {
    .buttons.large {
      flex-direction: column;
      align-items: start;
      justify-content: stretch;
    }
  }
  </style>
