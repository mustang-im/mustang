<vbox class="account-general">
  <HeaderGroupBox>
    <hbox slot="header">{$account.name}</hbox>
    <svelte:fragment slot="buttons-top-right">
      <RoundButton
        label={$t`Delete account`}
        onClick={onDelete}
        icon={DeleteIcon}
        />
    </svelte:fragment>
    <vbox class="content">
      <grid>
        <label for="name">{$t`Account name`}</label>
        <input type="text" bind:value={account.name} name="name" on:change={() => useDebounce(() => catchErrors(onNameChange), 3000)}/>
      </grid>
    </vbox>
  </HeaderGroupBox>
</vbox>

<script lang="ts">
  import type { Account } from "../../logic/Abstract/Account";
  import { catchErrors } from "../Util/error";
  import { appName } from "../../logic/build";
  import HeaderGroupBox from "../Shared/HeaderGroupBox.svelte";
  import RoundButton from "../Shared/RoundButton.svelte";
  import DeleteIcon from "lucide-svelte/icons/trash-2";
  import { useDebounce } from '@svelteuidev/composables';
  import { t } from "../../l10n/l10n";

  export let account: Account;

  async function onNameChange() {
    await account.save();
  }
  async function onDelete() {
    let confirmed = confirm($t`Are you sure that you want to the delete account ${account.name} from ${appName} and all related data?`);
    if (!confirmed) {
      return;
    }
    await account.deleteIt();
  }
</script>

<style>
  .account-general {
    max-width: 40em;
  }

  grid {
    grid-template-columns: max-content auto;
    gap: 8px 24px;
  }
</style>
