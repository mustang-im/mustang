<hbox class="buttons">
  <Button
    label="Pretty"
    icon={HTMLIcon}
    iconOnly
    iconSize="16px"
    plain
    onClick={() => switchTo(DisplayMode.HTML)}
    selected={mode == DisplayMode.HTML}
    />
  <Button
    label="With external content (allows sender to track you)"
    icon={WithExternalIcon}
    iconOnly
    iconSize="16px"
    plain
    onClick={() => switchTo(DisplayMode.HTMLWithExternal)}
    selected={mode == DisplayMode.HTMLWithExternal}
    />
  <Button
    label="Plaintext"
    icon={PlaintextIcon}
    iconOnly
    iconSize="16px"
    plain
    onClick={() => switchTo(DisplayMode.Plaintext)}
    selected={mode == DisplayMode.Plaintext}
    />
  <Button
    label="Source"
    icon={SourceIcon}
    iconOnly
    iconSize="16px"
    plain
    onClick={() => switchTo(DisplayMode.Source)}
    selected={mode == DisplayMode.Source}
    />
</hbox>

<script lang="ts">
  import { getLocalStorage } from "../../Util/LocalStorage";
  import { selectedMessage } from "../Selected";
  import { DisplayMode } from "./MessageBody.svelte";
  import Button from "../../Shared/Button.svelte";
  import HTMLIcon from "lucide-svelte/icons/mail";
  import WithExternalIcon from "lucide-svelte/icons/image";
  import PlaintextIcon from "lucide-svelte/icons/type";
  import SourceIcon from "lucide-svelte/icons/code-xml";
  import { catchErrors } from "../../Util/error";

  export let mode: DisplayMode = DisplayMode.HTML;

  let modeSetting = getLocalStorage("mail.contentRendering", "html");
  $: mode = $modeSetting.value as DisplayMode;

  function switchTo(newMode: DisplayMode) {
    mode = newMode;
    modeSetting.value = newMode;

    if (mode != DisplayMode.HTMLWithExternal &&
      mode != DisplayMode.Source) {
      resetToMode = mode;
    }
  }

  let resetToMode = DisplayMode.HTML;
  $: $selectedMessage && catchErrors(onMessageChanged);
  function onMessageChanged() {
    if (mode != resetToMode) {
      mode = resetToMode;
      modeSetting.value = resetToMode;
    }
  }
</script>

<style>
  .buttons :global(button) {
    padding: 4px;
  }
</style>
