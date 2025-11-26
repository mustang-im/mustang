<Header
  title={$t`Set up your existing ${"SIP"} telephone account`}
  subtitle={$t`You can get the configuration from your ${"SIP"} phone operator.`}
/>
<vbox flex class="account">
  <grid>
    <label for="domain">{$t`${"SIP"} domain`}</label>
    <input type="text" bind:value={config.domain} name="domain"
      placeholder="tele.com" autofocus />
    <label for="username">{$t`Your ${"SIP"} user`}</label>
    <input type="text" bind:value={config.username} name="username"
      placeholder="fred" />
    <label for="password">{$t`Password`}</label>
    <Password bind:password={config.password} />
    <label for="hostname">{$t`${"SIP"} server`}</label>
    <input type="text" bind:value={config.hostname} name="hostname"
      placeholder="sip.tele.com" />
    <label for="port">{$t`${"SIP"} server port`}</label>
    <input type="number" bind:value={config.port} name="port"
      min={1} max={65535} step={1} />
  </grid>
</vbox>

<ButtonsBottom
  onContinue={onContinue}
  canContinue={!!config.username && !!config.password && !!config.domain && !!config.hostname}
  canCancel={true}
  onCancel={onCancel}
  />

<script lang="ts">
  import { SIPAccount } from "../../../logic/Meet/SIP/SIPAccount";
  import { appGlobal } from "../../../logic/app";
  import Password from "../Shared/Password.svelte";
  import ButtonsBottom from "../Shared/ButtonsBottom.svelte";
  import Header from "../Shared/Header.svelte";
  import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
  import { t } from "../../../l10n/l10n";

  /** in/out */
  export let config: SIPAccount;
  /** out */
  export let showPage: ConstructorOfATypedSvelteComponent;
  export let onCancel = (event: Event) => undefined;

  config.port ??= 443;

  async function onContinue() {
    sanitize.hostname(config.domain);
    sanitize.hostname(config.hostname);
    sanitize.portTCP(config.port);
    sanitize.emailAddress(config.username + "@" + config.domain);

    config.name = config.domain;
    config.url = "wss://" + config.hostname + ":" + config.port;
    config.realname = appGlobal.me.name;

    await config.login(true);
    await config.save();
    appGlobal.meetAccounts.add(config);
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
