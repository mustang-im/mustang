<input type="password" bind:value={newPassword} on:change={onPasswordChanged} placeholder="••••••••" />

<script lang="ts">
  /** Does not populate the existing password into the text field,
   * to avoid copying it by malicious users,
   * but allows to change it. */

  /** out only */
  export let password: string;

  let newPassword: string;
  function onPasswordChanged() {
    password = newPassword;
  }
</script>
