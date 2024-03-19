<hbox class="password">
  <input type="password" bind:value={password} placeholder="Your password" bind:this={inputEl} />
  <hbox class="buttons">
    <Button classes="cleartext"
      on:click={() => cleartext = !cleartext}
      icon={cleartext ? EyeIcon : EyeOffIcon}
      plain
      />
  </hbox>
</hbox>

<script lang="ts">
  import Button from "../../Shared/Button.svelte";
  import EyeIcon from "lucide-svelte/icons/eye";
  import EyeOffIcon from "lucide-svelte/icons/eye-off";

  /** in/out */
  export let password: string;

  let cleartext = false;
  let inputEl: HTMLInputElement;

  $: if (inputEl) inputEl.type = cleartext ? "text" : "password";
</script>

<style>
  .password {
    margin: 8px 0 8px 0;
  }
  input {
    height: 24px;
  }
  .buttons {
    min-width: 32px;
  }
</style>
