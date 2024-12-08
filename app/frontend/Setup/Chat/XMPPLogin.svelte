<Header
  title={$t`Set up your existing XMPP account`}
  subtitle={$t`You can use ${appName} with your existing XMPP or Jabber account.`}
/>
<vbox flex class="account">
  <grid>
    <label for="username">{$t`Your JID`}</label>
    <!-- svelte-ignore a11y-autofocus -->
    <input type="text" bind:value={jid} name="username"
      placeholder="fred@example.com" autofocus />
    <label for="password">{$t`Password`}</label>
    <Password bind:password={config.password} />
  </grid>
</vbox>

<ButtonsBottom
  onContinue={onContinue}
  canContinue={!!config.username && !!config.serverDomain && !!config.password}
  canCancel={true}
  onCancel={onCancel}
  />

<script lang="ts">
  import type { XMPPAccount } from "../../../logic/Chat/XMPP/XMPPAccount";
  import { appGlobal } from "../../../logic/app";
  import Password from "../Shared/Password.svelte";
  import ButtonsBottom from "../Shared/ButtonsBottom.svelte";
  import Header from "../Shared/Header.svelte";
  import { appName } from "../../../logic/build";
  import { t } from "../../../l10n/l10n";

  /** in/out */
  export let config: XMPPAccount;
  /** out */
  export let showPage: ConstructorOfATypedSvelteComponent;
  export let onCancel = (event: Event) => undefined;

  let jid: string;
  $: splitJID(jid);
  function splitJID(_dummy: any) {
    let sp = jid?.split("@");
    if (!sp || sp.length != 2) {
      return;
    }
    config.username = sp[0];
    config.serverDomain = sp[1];
    config.name = jid;
    config.userRealname = appGlobal.me.name;
  }

  async function onContinue() {
    await config.save();
    appGlobal.chatAccounts.add(config);
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
