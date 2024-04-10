<grid>
  <label for="url">Server URL</label>
  <hbox class="value">{account.url}</hbox>
  <label for="username">Username</label>
  <hbox class="value">{account.username}</hbox>
</grid>

<script lang="ts">
  import type { Account } from "../../logic/Abstract/Account";

  export let account: Account;
</script>

<style>
  grid {
    grid-template-columns: max-content auto;
    gap: 8px 24px;
  }
</style>
