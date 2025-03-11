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
  canContinue={!!config.username && !!config.serverDomain && !!config.password}
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
    // Fake data, not needed for XMPP lib. Just make the database happy.
    config.hostname = jid ? getDomainForEmailAddress(jid) : null;
    config.port = 5222;
    config.tls = TLSSocketType.TLS;
  }

  async function onContinue() {
    await config.login();
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
