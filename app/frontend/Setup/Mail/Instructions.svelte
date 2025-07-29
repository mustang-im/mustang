<Header
  title={$t`Set up email address`}
  subtitle={$t`${config.name} requires you to do some manual steps for initial set up`} />

<ol class="instructions">
  {#each config.setup.instructions as step}
    <li>
      {#if step.url}
        <a href={step.url} target="_blank">
          <Button label={$t`Go to ${config.name} *=> Go to Google`} classes="filled" />
        </a>
      {:else if step.enterPassword}
        {step.instruction || $t`Password`}
        <Password bind:password />
      {:else if step.enterUsername}
        {step.instruction || $t`Username`}
        <input type="text" bind:value={config.username} />
      {:else if step.instruction}
        {step.instruction}
      {/if}
      </li>
  {/each}
</ol>

<script lang="ts">
  import type { MailAccount } from "../../../logic/Mail/MailAccount";
  import Header from "../Shared/Header.svelte";
  import Button from "../../Shared/Button.svelte";
  import Password from "../Shared/Password.svelte";
  import { t } from "../../../l10n/l10n";

  export let config: MailAccount;
  export let password: string; /** in/out */
</script>

<style>
  li {
    margin-block-end: 8px;
  }
</style>
