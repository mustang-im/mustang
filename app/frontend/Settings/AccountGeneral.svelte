<Scroll>
  <vbox flex class="panel">
    <grid>
      <label for="name">Account name</label>
      <input type="value" bind:value={account.name} name="name" />
    </grid>
    <hbox flex />
    <hbox class="buttons">
      <Button label="Delete account"
        classes="delete"
        on:click={() => catchErrors(onDelete)}
        />
    </hbox>
  </vbox>
</Scroll>

<script lang="ts">
  import type { Account } from "../../logic/Abstract/Account";
  import type { MailAccount } from "../../logic/Mail/MailAccount";
  import Button from "../Shared/Button.svelte";
  import Scroll from "../Shared/Scroll.svelte";
  import { catchErrors } from "../Util/error";

  export let account: Account;

  $: mailAccount = account as MailAccount;

  async function onDelete() {
    let confirmed = confirm(`Are you sure that you want to the delete account ${account.name} from Mustang and all related data?`);
    if (!confirmed) {
      return;
    }
    await account.deleteIt();
  }
</script>

<style>
  .panel {
    margin: 32px;
  }
  grid {
    grid-template-columns: max-content auto;
    gap: 8px 24px;
  }
  .buttons {
    justify-content: end;
  }
  .buttons :global(button.delete) {
    background-color: lightsalmon;
  }
</style>
