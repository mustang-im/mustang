<hbox class="mail-address">
  <input type="email" bind:value={emailAddress} bind:this={inputEl} placeholder="you@example.com" />
  <hbox class="icon" class:valid>
    {#if valid}
      {#if emailAddress.endsWith("@gmail.com")}
        <Icon data={GMailIcon} size="16px" />
      {:else if emailAddress.includes("@yahoo.")}
        <Icon data={YahooIcon} size="16px" />
      {:else if emailAddress.includes("@outlook.") || emailAddress.includes("@hotmail.") || emailAddress.includes("@live.")}
        <Icon data={Microsoft365Icon} size="16px" />
      {:else}
        <CheckIcon />
      {/if}
    {:else if emailAddress}
    {:else}
      <Icon data={GMailIcon} size="16px" />    
      <Icon data={Microsoft365Icon} size="16px" />
      <Icon data={YahooIcon} size="16px" />
    {/if}
  </hbox>
</hbox>

<script lang="ts">
  import Icon from 'svelte-icon/Icon.svelte';
  import CheckIcon from "lucide-svelte/icons/check";
  import GMailIcon from '../../asset/icon/brand/gmail.svg?raw';
  import Microsoft365Icon from '../../asset/icon/brand/microsoft365.svg?raw';
  import YahooIcon from '../../asset/icon/brand/yahoo.svg?raw';

  /** in/out */
  export let emailAddress: string;

  let inputEl: HTMLInputElement;
  $: valid = emailAddress && emailAddress.includes(".") && inputEl?.validity.valid;
</script>

<style>
  .mail-address {
    margin: 8px 0 8px 0;
  }
  input {
    height: 24px;
  }
  input:invalid {
    border-bottom-color: red;
  }
  .icon {
    min-width: 32px;
  }
  .icon :global(> *) {
    margin-left: 2px;
  }
  .icon.valid {
    color: #20AE9E;
  }
</style>
