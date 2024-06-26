<grid>
  <label for="url">{$t`Server URL`}</label>
  <hbox class="value">{account.url}</hbox>
  <label for="username">{$t`Username`}</label>
  <hbox class="value">{account.username}</hbox>
</grid>

<script lang="ts">
  import type { Account } from "../../logic/Abstract/Account";
  import { t } from "svelte-i18n-lingui";

  export let account: Account;
</script>

<style>
  grid {
    grid-template-columns: max-content auto;
    gap: 8px 24px;
  }
</style>
