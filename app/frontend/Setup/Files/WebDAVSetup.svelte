<Header
  title={$t`Set up your existing WebDAV account`}
  subtitle=""
/>
<vbox flex class="account">
  <grid>
    <label for="name">{$t`Name of the filesharing account`}</label>
    <input type="text" bind:value={config.name} name="name"
      placeholder={$t`Private`} autofocus />
    <label for="name">{$t`Server URL`}</label>
    <input type="text" bind:value={config.url} name="url"
      placeholder={$t`https://dav.yourcompany.com/files/`} />
    <label for="name">{$t`Username`}</label>
    <input type="text" bind:value={config.username} name="username"
      placeholder={$t`fred`} />
    <label for="name">{$t`Password`}</label>
    <Password bind:password={config.password} />
  </grid>
</vbox>

<ButtonsBottom
  onContinue={onContinue}
  canContinue={!!config.name}
  canCancel={true}
  onCancel={onCancel}
  />

<script lang="ts">
  import { FileSharingAccount } from "../../../logic/Files/FileSharingAccount";
  import { AuthMethod } from "../../../logic/Abstract/Account";
  import { appGlobal } from "../../../logic/app";
  import Password from "../Shared/Password.svelte";
  import ButtonsBottom from "../Shared/ButtonsBottom.svelte";
  import Header from "../Shared/Header.svelte";
  import { t } from "../../../l10n/l10n";

  /** in/out */
  export let config: FileSharingAccount;
  /** out */
  export let showPage: ConstructorOfATypedSvelteComponent;
  export let onCancel = (event: Event) => undefined;

  async function onContinue() {
    config.authMethod = AuthMethod.Password;
    await config.verifyLogin();
    await config.save();
    appGlobal.fileSharingAccounts.add(config);
    showPage = null;
  }
</script>

<style>
  grid {
    grid-template-columns: max-content auto;
    align-items: center;
    margin: 32px;
    gap: 8px 24px;
  }
</style>
