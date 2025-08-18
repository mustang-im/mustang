<vbox class="buttons">
  {#if isDefaultApp}
    <hbox>
      <hbox class="icon">
        <DoneIcon />
      </hbox>
      {gt`Correctly configured in the system as your mail application`}
    </hbox>
  {:else}
    <Button
      icon={DoIcon}
      onClick={setDefaultApp}
      label={gt`Set as your mail application`}
    />
  {/if}
</vbox>

<script lang="ts">
  import Button from "../../Shared/Button.svelte";
  import { appGlobal } from "../../../logic/app";
  import DoIcon from "lucide-svelte/icons/mail-plus";
  import DoneIcon from "lucide-svelte/icons/check";
  import { gt } from "../../../l10n/l10n";

  let isDefaultApp = false;

  $: checkIsDefaultApp();

  async function checkIsDefaultApp() {
    isDefaultApp = await appGlobal.remoteApp.isDefaultApp("mailto");
  }

  async function setDefaultApp() {
    isDefaultApp = await appGlobal.remoteApp.setAsDefaultApp("mailto");
  }
</script>

<style>
  .buttons {
    align-items: start;
  }
  .icon {
    margin-inline-end: 8px;
    color: green;
  }
</style>
