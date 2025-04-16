<vbox flex>
  <hbox class="header">
    <hbox class="emailAddress font-small">{$account.emailAddress}</hbox>
    <hbox flex />
    <!--
    {#if oAuth2Running != OAuth2UIMethod.Embed}
      <Button label={$t`Login`}
        onClick={loginEmbed}
        errorCallback={onError}
        />
    {/if}
    <Button label={$t`Login in browser`}
      onClick={loginBrowser}
      errorCallback={onError}
      />
    <Button label={showConfirmCopied ? $t`URL copied` : $t`Copy URL`}
      onClick={loginCopyURL}
      errorCallback={onError}
      />
      -->
  </hbox>
  {#if oAuth2Running == OAuth2UIMethod.Embed}
    <vbox class="browser">
      <OAuth2EmbeddedBrowser dialog={embed} withURLbar={false} />
    </vbox>
  {:else if oAuth2Running == OAuth2UIMethod.SystemBrowser || oAuth2Running == OAuth2UIMethod.Localhost}
    <Spinner size="128px" />
  {/if}
</vbox>

<script lang="ts">
  import type { MailAccount } from "../../../logic/Mail/MailAccount";
  import { OAuth2UIMethod } from "../../../logic/Auth/UI/OAuth2UIMethod";
  import { OAuth2Embed } from "../../../logic/Auth/UI/OAuth2Embed";
  import { OAuth2Localhost } from "../../../logic/Auth/UI/OAuth2Localhost";
  import { NotImplemented, sleep, type URLString } from "../../../logic/util/util";
  import OAuth2EmbeddedBrowser from "../../Shared/Auth/OAuth2EmbeddedBrowser.svelte";
  import Spinner from "../../Shared/Spinner.svelte";
  import Button from "../../Shared/Button.svelte";
  import { t } from "../../../l10n/l10n";
  import { onMount } from "svelte";
  import { catchErrors } from "../../Util/error";

  export let account: MailAccount;
  export let startWith: OAuth2UIMethod | null = OAuth2UIMethod.Embed;
  export let onContinue = () => undefined;
  export let onError = (ex: Error) => undefined;

  let oAuth2Running: OAuth2UIMethod | null = null;
  let embed: OAuth2Embed;

  onMount(() => catchErrors(async () => {
    if (startWith == OAuth2UIMethod.Embed) {
      await loginEmbed();
    } else {
      throw new NotImplemented();
    }
  }, onError));

  async function loginEmbed() {
    abortCurrentMethod();
    oAuth2Running = OAuth2UIMethod.Embed;
    account.oAuth2.uiMethod = oAuth2Running;
    embed = new OAuth2Embed(account.oAuth2);
    let authCode = await embed.login();
    await account.oAuth2.getAccessTokenFromAuthCode(authCode);
    account.oAuth2.uiMethod = OAuth2UIMethod.Tab;
    oAuth2Running = null;
    embed = null;
    onContinue();
  }

  async function loginBrowser() {
    oAuth2Running = OAuth2UIMethod.SystemBrowser;
    account.oAuth2.uiMethod = oAuth2Running;
    abortCurrentMethod();
    await account.oAuth2.login(true);
    oAuth2Running = null;
    onContinue();
  }

  let url: URLString | null = null;

  async function loginCopyURL() {
    if (oAuth2Running == OAuth2UIMethod.Localhost && url) {
      await showCopyURL(url);
      return;
    }
    abortCurrentMethod();
    oAuth2Running = OAuth2UIMethod.Localhost;
    account.oAuth2.uiMethod = oAuth2Running;
    let localhost = new OAuth2Localhost(account.oAuth2);
    localhost.loginURLCallback = showCopyURL;
    let authCode = await localhost.login();
    await this.getAccessTokenFromAuthCode(authCode);
    // account.oAuth2.uiMethod = TODO
    url = null;
    oAuth2Running = null;
    onContinue();
  }

  async function showCopyURL(loginURL: URLString) {
    url = loginURL;
    navigator.clipboard.writeText(loginURL);
    confirmCopied()
      .catch(console.error);
  }

  let showConfirmCopied = false;
  async function confirmCopied() {
    showConfirmCopied = true;
    await sleep(2);
    showConfirmCopied = false;
  }

  function abortCurrentMethod() {
    // TODO
  }
</script>

<style>
  .header {
    align-items: center;
    margin-block-end: 16px;
  }
  .header :global(> button) {
    margin-inline-end: 12px;
  }
  .emailAddress {
    word-wrap: break-word;
    margin-inline-end: 24px;
  }
  .browser {
    min-height: 500px;
    min-width: 500px;
  }
</style>
