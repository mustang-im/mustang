<vbox class="infobar-selector">
  <RoundButton
    label={isOpen ? $t`Close the info sidebar` : $t`Open the info sidebar`}
    icon={isOpen ? CloseIcon : OpenIcon}
    onClick={() => setOpen(!isOpen)}
    classes="plain" border={false}
    />
  <hbox class="separator-top" />

  <AppSelector bind:app {isOpen} on:selected={() => setOpen(true)} />
  <hbox flex />
</vbox>

<script lang="ts">
  import { PersonUID } from "../../../logic/Abstract/PersonUID";
  import { EMail } from "../../../logic/Mail/EMail";
  import { getLocalStorage } from "../../Util/LocalStorage";
  import AppSelector from "./AppSelector.svelte";
  import RoundButton from "../../Shared/RoundButton.svelte";
  import OpenIcon from "lucide-svelte/icons/chevrons-left";
  import CloseIcon from "lucide-svelte/icons/chevrons-right";
  import { t } from "../../../l10n/l10n";

  /** About which person to show the content - in only */
  export let person: PersonUID;
  /** About which email to show the content - in only */
  export let message: EMail;
  /** Whether to show the content.
   * false = show only selector
   * true = show selector and content
   * out */
  export let isOpen: boolean;
  /** Which app should show the content - out */
  export let app: any;

  let openSetting = getLocalStorage("mail.infoSidebar.open", false);
  $: isOpen = $openSetting.value;

  function setOpen(open: boolean) {
    openSetting.value = open;
  }
</script>

<style>
  .infobar-selector {
    background-color: var(--leftbar-bg);
    color: var(--leftbar-fg);
    box-shadow: 1px 0px 3px 0px rgba(0, 0, 0, 4%); /* Also on MessageList */
    margin-inline: 3px; /* Allow shadow to show, left (paper) and right (box-shadow above) */
    padding-block-start: 6px; /* Align open/close button with message toolbar buttons */
  }
</style>
