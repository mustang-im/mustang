<hbox class="buttons">
  <Button
    label={$t`Thread`}
    icon={ThreadIcon}
    iconOnly
    iconSize="16px"
    plain
    onClick={() => switchTo(DisplayMode.Thread)}
    selected={mode == DisplayMode.Thread}
    />
  <Button
    label={$t`Formatted`}
    icon={HTMLIcon}
    iconOnly
    iconSize="16px"
    plain
    onClick={() => switchTo(DisplayMode.HTML)}
    selected={mode == DisplayMode.HTML}
    />
  <Button
    label={$t`With external content (allows sender to track you)`}
    icon={WithExternalIcon}
    iconOnly
    iconSize="16px"
    plain
    onClick={() => switchTo(DisplayMode.HTMLWithExternal)}
    selected={mode == DisplayMode.HTMLWithExternal}
    />
  <Button
    label={$t`Plaintext`}
    icon={PlaintextIcon}
    iconOnly
    iconSize="16px"
    plain
    onClick={() => switchTo(DisplayMode.Plaintext)}
    selected={mode == DisplayMode.Plaintext}
    />
  {#if mode == DisplayMode.Source}
    <Button
      label={$t`Source`}
      icon={SourceIcon}
      iconOnly
      iconSize="16px"
      plain
      onClick={() => switchTo(DisplayMode.Source)}
      selected={mode == DisplayMode.Source}
      />
  {/if}
</hbox>

<script lang="ts">
  import { getLocalStorage } from "../../Util/LocalStorage";
  import { selectedMessage } from "../Selected";
  import { DisplayMode } from "./MessageBody.svelte";
  import Button from "../../Shared/Button.svelte";
  import ThreadIcon from "lucide-svelte/icons/message-square-text";
  import HTMLIcon from "lucide-svelte/icons/mail";
  import WithExternalIcon from "lucide-svelte/icons/image";
  import PlaintextIcon from "lucide-svelte/icons/type";
  import SourceIcon from "lucide-svelte/icons/code-xml";
  import { catchErrors } from "../../Util/error";
  import { t } from "svelte-i18n-lingui";

  export let mode: DisplayMode = DisplayMode.HTML;

  let modeSetting = getLocalStorage("mail.contentRendering", "html");
  $: mode = $modeSetting.value as DisplayMode;

  function switchTo(newMode: DisplayMode) {
    mode = newMode;
    modeSetting.value = newMode;
  }

  $: $selectedMessage && catchErrors(onMessageChanged);
  function onMessageChanged() {
    if (mode == DisplayMode.HTMLWithExternal) {
      switchTo(DisplayMode.HTML);
    }
  }
</script>

<style>
  .buttons :global(button) {
    padding: 4px;
  }
</style>
