<hbox class="buttons">
  <Button
    label="Chat-like mail view"
    icon={ChatIcon}
    iconOnly
    iconSize="16px"
    plain
    on:click={() => catchErrors(() => switchTo('chat'))}
    selected={view == "chat"}
    />
  <Button
    label="Classic 3-pane view"
    icon={ThreePaneIcon}
    iconOnly
    iconSize="16px"
    plain
    on:click={() => catchErrors(() => switchTo('3pane'))}
    selected={view == "3pane"}
    />
</hbox>

<script lang="ts">
  import { getLocalStorage } from "../../Util/LocalStorage";
  import { catchErrors } from "../../Util/error";
  import Button from "../../Shared/Button.svelte";
  import ChatIcon from "lucide-svelte/icons/message-square";
  import ThreePaneIcon from "lucide-svelte/icons/layout-panel-left";

  let viewSetting = getLocalStorage("mail.view", "3pane");
  $: view = $viewSetting.value;

  function switchTo(newView: string) {
    viewSetting.value = newView;
  }
</script>

<style>
  .buttons :global(button) {
    padding: 4px;
  }
</style>
