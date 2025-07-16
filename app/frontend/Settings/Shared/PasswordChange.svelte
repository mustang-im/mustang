<hbox class="password-change" flex>
  <input type="password"
    bind:value={newPassword}
    placeholder="••••••••"
    {tabindex}
    />
  {#if newPassword && newPassword != password}
    <Button
      icon={SaveIcon}
      label={$t`Save`}
      onClick={onPasswordChanged}
      iconOnly iconSize="14px" plain classes="small"
      />
  {/if}
  <hbox title={"Password:\nOld: " + password + "\nNew: " + newPassword}>P</hbox>
</hbox>

<script lang="ts">
  import { t } from "../../../l10n/l10n";
  import Button from "../../Shared/Button.svelte";
  import SaveIcon from "lucide-svelte/icons/check";

  /** Does not populate the existing password into the text field,
   * to avoid copying it by malicious users,
   * but allows to change it. */

  /** out only */
  export let password: string;
  export let tabindex: number | undefined = undefined;

  let newPassword = "";
  function onPasswordChanged() {
    if (newPassword) {
      password = newPassword;
    }
  }
</script>
