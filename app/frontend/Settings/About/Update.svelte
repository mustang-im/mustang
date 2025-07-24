<vbox class="update">
  {#await checkForUpdate()}
    <div class="status">{$t`Checking for updates…`}</div>
  {:then}
    {#if haveUpdate}
      <div class="status">{$t`You can update`}</div>
      <Button label={$t`Install update`} onClick={installUpdate} />
    {:else}
      <div class="status">{$t`This is the latest version`}</div>
      <Button label={$t`Check for update`} onClick={checkForUpdate} errorCallback={showError} />
    {/if}
  {:catch ex}
    {errorEx = ex}
  {/await}
  {#if errorEx}
    <ErrorMessageInline ex={errorEx} />
  {/if}
</vbox>

<script lang="ts">
  import { appGlobal } from '../../../logic/app';
  import ErrorMessageInline from '../../Shared/ErrorMessageInline.svelte';
  import Button from '../../Shared/Button.svelte';
  import { t } from '../../../l10n/l10n';

  let haveUpdate = false;

  /** @returns have update */
  async function checkForUpdate(): Promise<boolean> {
    haveUpdate = await appGlobal.remoteApp.checkForUpdate();
    return haveUpdate;
  }

  async function installUpdate() {
    await appGlobal.remoteApp.installUpdate();
  }

  let errorEx: Error;
  function showError(ex: Error) {
    errorEx = ex;
  }
</script>

<style>
  .update {
    align-items: start;
  }
  .status {
    margin-block-end: 8px;
  }
</style>
