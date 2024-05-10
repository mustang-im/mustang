<hbox class="darkmode buttons">
  <Button
    label="System"
    icon={SystemIcon}
    iconOnly
    iconSize="16px"
    plain
    onClick={() => switchTo('system')}
    selected={mode == "system"}
    />
  <Button
    label="Light"
    icon={LightIcon}
    iconOnly
    iconSize="16px"
    plain
    onClick={() => switchTo('light')}
    selected={mode == "light"}
    />
  <Button
    label="Dark"
    icon={DarkIcon}
    classes="vertical"
    iconOnly
    iconSize="16px"
    plain
    onClick={() => switchTo('dark')}
    selected={mode == "dark"}
    />
</hbox>

<script lang="ts">
  import { getLocalStorage } from "../../Util/LocalStorage";
  import Button from "../../Shared/Button.svelte";
  import DarkIcon from "lucide-svelte/icons/moon";
  import LightIcon from "lucide-svelte/icons/sun";
  import SystemIcon from "lucide-svelte/icons/app-window";

  let modeSetting = getLocalStorage("appearance.darkmode", "system");
  $: mode = $modeSetting.value;

  function switchTo(newMode: "system" | "light" | "dark") {
    modeSetting.value = newMode;
  }
</script>

<style>
  .buttons :global(button) {
    padding: 4px;
  }
</style>
