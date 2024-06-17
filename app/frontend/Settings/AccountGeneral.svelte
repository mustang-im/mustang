<grid>
  <label for="name">Account name</label>
  <input type="text" bind:value={account.name} name="name" on:change={() => catchErrors(onNameChange)}/>
</grid>
<hbox flex />
<hbox class="buttons">
  <Button label="Delete account"
    classes="delete"
    onClick={onDelete}
    />
</hbox>

<script lang="ts">
  import type { Account } from "../../logic/Abstract/Account";
  import type { MailAccount } from "../../logic/Mail/MailAccount";
  import Button from "../Shared/Button.svelte";
  import { catchErrors } from "../Util/error";
  import { appName } from "../build";

  export let account: Account;

  $: mailAccount = account as MailAccount;

  async function onNameChange() {
    await account.save();
  }
  async function onDelete() {
    let confirmed = confirm(`Are you sure that you want to the delete account ${account.name} from ${appName} and all related data?`);
    if (!confirmed) {
      return;
    }
    await account.deleteIt();
  }
</script>

<style>
  grid {
    grid-template-columns: max-content auto;
    gap: 8px 24px;
  }
  .buttons {
    justify-content: end;
  }
  .buttons :global(button) {
    margin-left: 8px;
  }
  .buttons :global(button.delete) {
    background-color: lightsalmon;
    color: black;
  }
</style>
