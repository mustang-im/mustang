<Header
  title={$t`Set up your existing XMPP account`}
  subtitle={$t`Import your existing XMPP or Jabber account`}
/>
<vbox flex class="account">
  <grid>
    <label for="username">{$t`Your JID`}</label>
    <input type="text" bind:value={jid} name="username"
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
  import type { XMPPAccount } from "../../../logic/Chat/XMPP/XMPPAccount";
  import { TLSSocketType } from "../../../logic/Mail/MailAccount";
  import { getDomainForEmailAddress } from "../../../logic/util/netUtil";
  import { appGlobal } from "../../../logic/app";
  import Password from "../Shared/Password.svelte";
  import ButtonsBottom from "../Shared/ButtonsBottom.svelte";
  import Header from "../Shared/Header.svelte";
  import { t } from "../../../l10n/l10n";

  /** in/out */
  export let config: XMPPAccount;
  /** out */
  export let showPage: ConstructorOfATypedSvelteComponent;
  export let onCancel = (event: Event) => undefined;

  let jid: string;
  $: setUsername(jid);
  function setUsername(_dummy: any) {
    if (!jid) {
      return;
    }
    config.username = jid;
    config.name = jid;
    config.userRealname = appGlobal.me.name ?? config.username;
    config.hostname = getDomainForEmailAddress(jid);
    config.port = 5281;
    config.tls = TLSSocketType.TLS;
    config.url = `wss://${config.hostname}:${config.port}/xmpp-websocket`;
  }

  async function onContinue() {
    await config.verifyLogin();
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
