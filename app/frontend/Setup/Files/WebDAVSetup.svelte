<Header
  title={$t`Set up your existing WebDAV account`}
  subtitle=""
/>
<vbox flex class="account">
  <grid>
    <label for="name">{$t`Account name`}</label>
    <input type="text" bind:value={config.name} name="name"
      placeholder={$t`Private`} autofocus />
    <label for="url">{$t`Server URL`}</label>
    <input type="text" bind:value={config.url} name="url"
      placeholder="https://files.yourcompany.com" />
    <label for="username">{$t`Username`}</label>
    <input type="text" bind:value={config.username} name="username"
      placeholder={$t`fred`} />
    <label for="password">{$t`Password`}</label>
    <Password bind:password={config.password} />
  </grid>
</vbox>

<ErrorMessageInline bind:this={errorUI} />

<ButtonsBottom
  onContinue={() => catchErrors(onContinue, errorUI.showError)}
  canContinue={!!config.name && !!config.url && !!config.username}
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
  import ErrorMessageInline from "../../Shared/ErrorMessageInline.svelte";
  import { catchErrors } from "../../Util/error";
  import { t } from "../../../l10n/l10n";

  /** in/out */
  export let config: FileSharingAccount;
  /** out */
  export let showPage: ConstructorOfATypedSvelteComponent;
  export let onCancel = (event: Event) => undefined;

  let errorUI: ErrorMessageInline;

  async function onContinue() {
    errorUI.clearError();
    config.authMethod = AuthMethod.Password;
    await config.verifyLogin();
    await config.login(true);
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
