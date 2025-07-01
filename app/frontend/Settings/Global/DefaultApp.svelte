<Button
  disabled={isDefaultApp}
  on:click={setDefaultApp}
  label={gt`Set as default`}
/>

<script lang="ts">
  import Button from "../../Shared/Button.svelte";
  import { appGlobal } from "../../../logic/app";
  import { gt } from "../../../l10n/l10n";

  let isDefaultApp = false;

  $: checkIsDefaultApp();

  async function checkIsDefaultApp() {
    isDefaultApp = await appGlobal.remoteApp?.isDefaultApp();
  }

  async function setDefaultApp() {
    isDefaultApp = await appGlobal.remoteApp.setAsDefaultApp();
  }
</script>
