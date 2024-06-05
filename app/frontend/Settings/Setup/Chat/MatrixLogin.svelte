<Header
  title="Set up your existing Matrix account"
  subtitle="You can use Mustang with your existing Matrix account or you can create a new Matrix account."
/>
<vbox flex class="account">
  <grid>
    <label for="username">Your Matrix ID</label>
    <input type="text" bind:value={userID} name="username"
      placeholder="@fred:matrix.org" />
    <label for="password">Password</label>
    <Password bind:password />
  </grid>
</vbox>

<ButtonsBottom
  on:continue={() => catchErrors(onContinue)}
  canContinue={!!config.username && !!config.baseURL}
  canCancel={true}
  on:cancel
  />

<script lang="ts">
  import type { MatrixAccount } from "../../../../logic/Chat/Matrix/MatrixAccount";
  import { SQLChatAccount } from "../../../../logic/Chat/SQL/SQLChatAccount";
  import { appGlobal } from "../../../../logic/app";
  import Password from "../Shared/Password.svelte";
  import ButtonsBottom from "../Shared/ButtonsBottom.svelte";
  import Header from "../Shared/Header.svelte";
  import { catchErrors } from "../../../Util/error";

  /** in/out */
  export let config: MatrixAccount;
  /** out */
  export let showPage: ConstructorOfATypedSvelteComponent;

  let password: string;
  let userID: string;
  $: splitJID(userID);
  function splitJID(_dummy: any) {
    if (!userID?.startsWith("@")) {
      return;
    }
    let sp = userID?.substring(1).split(":");
    if (!sp || !sp.length || sp.length > 2) {
      return;
    }
    config.username = sp[0];
    config.baseURL = sp[1] ? "https://" + sp[1] : "https://matrix.org";
    config.password = password;
    config.name = userID;
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
