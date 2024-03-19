<hbox class="password">
  <input type="password"
    placeholder="Your password"
    bind:value={password}
    bind:this={inputEl}
    on:keydown={onKey}
    />
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
  import { createEventDispatcher } from 'svelte';
  const dispatchEvent = createEventDispatcher();

  /** in/out */
  export let password: string;

  let cleartext = false;
  let inputEl: HTMLInputElement;
  $: if (inputEl) inputEl.type = cleartext ? "text" : "password";

  function onKey(event: KeyboardEvent) {
    if (event.key == "Enter") {
      dispatchEvent("continue");
      event.preventDefault();
    }
  }

  export function focus() {
    inputEl.focus();
  }
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
