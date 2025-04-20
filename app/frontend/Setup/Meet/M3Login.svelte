<Header
  title={$t`Set up your existing ${appName} account for meetings`}
  subtitle={$t`If you don't have an account yet, you can subscribe on our website.`}
/>
<vbox flex class="account">
  <grid>
    <label for="username">{$t`Your ${appName} email address`}</label>
    <input type="text" bind:value={config.username} name="username"
      placeholder="fred@example.com" autofocus />
    <label for="password">{$t`Password`}</label>
    <Password bind:password={config.password} />
  </grid>
</vbox>

<ButtonsBottom
  onContinue={onContinue}
  canContinue={!!config.username && !!config.password}
  canCancel={true}
  onCancel={onCancel}
  />

<script lang="ts">
  import type { MeetAccount } from "../../../logic/Meet/MeetAccount";
  import { appGlobal } from "../../../logic/app";
  import Password from "../Shared/Password.svelte";
  import ButtonsBottom from "../Shared/ButtonsBottom.svelte";
  import Header from "../Shared/Header.svelte";
  import { appName } from "../../../logic/build";
  import { t } from "../../../l10n/l10n";

  /** in/out */
  export let config: MeetAccount;
  /** out */
  export let showPage: ConstructorOfATypedSvelteComponent;
  export let onCancel = (event: Event) => undefined;

  async function onContinue() {
    config.name = config.username;
    config.realname = appGlobal.me.name;
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
