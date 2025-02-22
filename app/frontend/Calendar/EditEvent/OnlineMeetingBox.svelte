<hbox class="online-meeting" flex>
  <input type="url" bind:value={event.onlineMeetingURL} placeholder={$t`Meeting URL`} />
  <hbox class="buttons">
    <Button
      label={$t`Copy`}
      icon={CopyIcon}
      iconSize="16px"
      iconOnly
      plain
      disabled={!hasURL}
      on:click={onCopyMeetingURL}
      />
    <Button
      label={$t`Open`}
      icon={BrowserIcon}
      iconSize="16px"
      iconOnly
      plain
      disabled={!hasURL}
      on:click={onOpenMeetingURL}
      />
    <Button
      label={$t`Delete`}
      icon={DeleteIcon}
      iconSize="16px"
      iconOnly
      plain
      disabled={!event.isOnline}
      on:click={onRemove}
      />
  </hbox>
</hbox>

<script lang="ts">
  import type { Event } from "../../../logic/Calendar/Event";
  import { appGlobal } from "../../../logic/app";
  import Button from "../../Shared/Button.svelte";
  import CopyIcon from "lucide-svelte/icons/copy";
  import BrowserIcon from "lucide-svelte/icons/globe";
  import DeleteIcon from "lucide-svelte/icons/trash-2";
  import { t } from "../../../l10n/l10n";

  export let event: Event;

  $: hasURL = event.onlineMeetingURL?.startsWith("https://");

  function onCopyMeetingURL() {
    navigator.clipboard.writeText(event.onlineMeetingURL);
  }

  function onOpenMeetingURL() {
    appGlobal.remoteApp.openExternalURL(event.onlineMeetingURL);
  }

  function onAdd() {
    event.isOnline = true;
    // TODO Create meeting on server
    event.onlineMeetingURL = $t`will be created`;
  }

  function onRemove() {
    if (event.participants.hasItems && !event.isNew && !confirm($t`Changing the meeting URL might cause some participants to miss the meeting. Are you sure?`)) {
      return;
    }
    event.isOnline = false;
    // TODO Remove meeting from server
    event.onlineMeetingURL = null;
  }
</script>

<style>
  input {
    max-width: 20em;
  }
</style>
