<hbox class="online-meeting" flex>
  <input type="url" bind:value={event.onlineMeetingURL} placeholder={$t`Meeting URL`} />
  <hbox class="buttons">
    <Button
      label={$t`Delete`}
      icon={XIcon}
      iconSize="16px"
      iconOnly
      plain
      disabled={!event.onlineMeetingURL}
      on:click={onRemove}
      />
    <Button
      label={$t`Copy`}
      icon={CopyIcon}
      iconSize="16px"
      iconOnly
      plain
      disabled={!event.onlineMeetingURL}
      on:click={onCopyMeetingURL}
      />
    <Button
      label={$t`Open`}
      icon={BrowserIcon}
      iconSize="16px"
      iconOnly
      plain
      disabled={!event.onlineMeetingURL}
      on:click={onOpenMeetingURL}
      />
  </hbox>
</hbox>

<script lang="ts">
  import type { Event } from "../../../logic/Calendar/Event";
  import Button from "../../Shared/Button.svelte";
  import CopyIcon from "lucide-svelte/icons/copy";
  import BrowserIcon from "lucide-svelte/icons/globe";
  import XIcon from "lucide-svelte/icons/x";
  import { t } from "../../../l10n/l10n";
  import { appGlobal } from "../../../logic/app";

  export let event: Event;

  function onCopyMeetingURL() {
    navigator.clipboard.writeText(event.onlineMeetingURL);
  }

  function onOpenMeetingURL() {
    appGlobal.remoteApp.openExternalURL(event.onlineMeetingURL);
  }

  function onAdd() {
    // TODO Create meeting on server
    // event.onlineMeetingURL = ;
  }

  function onRemove() {
    // TODO Remove meeting from server
    event.onlineMeetingURL = null;
  }
</script>

<style>
  input {
    max-width: 20em;
  }
</style>
