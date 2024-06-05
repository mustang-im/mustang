<Header
  title="Set up your existing Mustang account for meetings"
  subtitle="If you don't have an account yet, you can subscribe on our website."
/>
<vbox flex class="account">
  <grid>
    <label for="username">Your Mustang email address</label>
    <input type="text" bind:value={config.username} name="username"
      placeholder="fred@example.com" />
    <label for="password">Password</label>
    <Password bind:password={config.password} />
  </grid>
</vbox>

<ButtonsBottom
  on:continue={() => catchErrors(onContinue)}
  canContinue={!!config.username && !!config.password}
  canCancel={true}
  on:cancel
  />

<script lang="ts">
  import type { MeetAccount } from "../../../../logic/Meet/MeetAccount";
  import { SQLMeetAccount } from "../../../../logic/Meet/SQL/SQLMeetAccount";
  import { appGlobal } from "../../../../logic/app";
  import Password from "../Shared/Password.svelte";
  import ButtonsBottom from "../Shared/ButtonsBottom.svelte";
  import Header from "../Shared/Header.svelte";
  import { catchErrors } from "../../../Util/error";

  /** in/out */
  export let config: MeetAccount;
  /** out */
  export let showPage: ConstructorOfATypedSvelteComponent;

  async function onContinue() {
    config.name = config.username;
    config.userRealname = appGlobal.me.name;
    await SQLMeetAccount.save(config);
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
