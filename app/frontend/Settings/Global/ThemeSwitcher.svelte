<hbox class="theme buttons">
  <Button
    label={$t`System`}
    icon={SystemIcon}
    iconSize="16px"
    plain
    onClick={() => switchTo('system')}
    selected={theme == "system"}
    />
  <Button
    label={$t`Light`}
    icon={LightIcon}
    iconSize="16px"
    plain
    onClick={() => switchTo('light')}
    selected={theme == "light"}
    />
  <Button
    label={$t`Dark`}
    icon={DarkIcon}
    classes="vertical"
    iconSize="16px"
    plain
    onClick={() => switchTo('dark')}
    selected={theme == "dark"}
    />
</hbox>

<script lang="ts">
  import { getLocalStorage } from "../../Util/LocalStorage";
  import Button from "../../Shared/Button.svelte";
  import DarkIcon from "lucide-svelte/icons/moon";
  import LightIcon from "lucide-svelte/icons/sun";
  import SystemIcon from "lucide-svelte/icons/app-window";
  import { t } from "../../../l10n/l10n";

  let themeSetting = getLocalStorage("appearance.theme", "system");
  $: theme = $themeSetting.value;

  function switchTo(newTheme: "system" | "light" | "dark") {
    themeSetting.value = newTheme;
  }
</script>

<style>
  .buttons :global(button) {
    padding: 8px;
    margin-inline-end: 12px;
  }
</style>
