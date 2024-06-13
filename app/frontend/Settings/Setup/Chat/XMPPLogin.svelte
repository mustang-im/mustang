<Header
  title="Set up your existing XMPP account"
  subtitle="You can use Mustang with your existing XMPP or Jabber account."
/>
<vbox flex class="account">
  <grid>
    <label for="username">Your JID</label>
    <input type="text" bind:value={jid} name="username"
      placeholder="fred@example.com" />
    <label for="password">Password</label>
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
  import type { XMPPAccount } from "../../../../logic/Chat/XMPP/XMPPAccount";
  import { SQLChatAccount } from "../../../../logic/Chat/SQL/SQLChatAccount";
  import { appGlobal } from "../../../../logic/app";
  import Password from "../Shared/Password.svelte";
  import ButtonsBottom from "../Shared/ButtonsBottom.svelte";
  import Header from "../Shared/Header.svelte";

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
    await SQLChatAccount.save(config);
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
