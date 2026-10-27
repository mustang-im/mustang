<IslandSwitcher border={false}>
  <Button
    label={$t`Thread`}
    icon={ThreadIcon}
    iconOnly
    iconSize="16px"
    onClick={() => switchTo(DisplayMode.Thread)}
    selected={mode == DisplayMode.Thread}
    />
  <Button
    label={$t`Formatted`}
    icon={HTMLIcon}
    iconOnly
    iconSize="16px"
    onClick={() => catchErrors(onFormatted)}
    selected={mode == DisplayMode.HTML && !$message?.loadExternalImages}
    />
  <Button
    label={$t`Always with external content from this sender (allows the sender to track you)`}
    icon={WithExternalIcon}
    iconOnly
    iconSize="16px"
    onClick={() => catchErrors(onWithExternal)}
    selected={$message?.loadExternalImages}
    />
  <Button
    label={$t`Plaintext`}
    icon={PlaintextIcon}
    iconOnly
    iconSize="16px"
    onClick={() => switchTo(DisplayMode.Plaintext)}
    selected={mode == DisplayMode.Plaintext}
    />
  {#if mode == DisplayMode.Source}
    <Button
      label={$t`Source`}
      icon={SourceIcon}
      iconOnly
      iconSize="16px"
      onClick={() => switchTo(DisplayMode.Source)}
      selected={mode == DisplayMode.Source}
      />
  {/if}
</IslandSwitcher>

<script lang="ts">
  import { getLocalStorage } from "../../Util/LocalStorage";
  import { selectedMessage } from "../Selected";
  import { DisplayMode } from "./MessageBody.svelte";
  import IslandSwitcher from "../../Shared/IslandSwitcher.svelte";
  import Button from "../../Shared/Button.svelte";
  import ThreadIcon from "lucide-svelte/icons/message-square-text";
  import HTMLIcon from "lucide-svelte/icons/mail";
  import WithExternalIcon from "lucide-svelte/icons/image";
  import PlaintextIcon from "lucide-svelte/icons/type";
  import SourceIcon from "lucide-svelte/icons/code-xml";
  import { catchErrors } from "../../Util/error";
  import { t } from "../../../l10n/l10n";

  export let mode: DisplayMode = DisplayMode.HTML;

  let modeSetting = getLocalStorage("mail.contentRendering", "html");
  $: mode = $modeSetting.value as DisplayMode;

  $: message = $selectedMessage;

  function switchTo(newMode: DisplayMode) {
    mode = newMode;
    modeSetting.value = newMode;
  }

  async function onFormatted() {
    let wasWithExternal = message?.loadExternalImages;
    switchTo(DisplayMode.HTML);
    if (wasWithExternal) {
      await message.setLoadExternalImagesFromSender(false);
    }
  }

  async function onWithExternal() {
    switchTo(DisplayMode.HTMLWithExternal);
    await message?.setLoadExternalImagesFromSender(true);
  }

  $: $selectedMessage && catchErrors(onMessageChanged);
  function onMessageChanged() {
    if (mode == DisplayMode.HTMLWithExternal) {
      switchTo(DisplayMode.HTML);
    }
  }
</script>
