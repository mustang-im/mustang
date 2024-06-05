<hbox flex class="status {status}">
  {#if status == "processing"}
    <Spinner size="24px" />
  {/if}
  <hbox flex class="box">
    <hbox class="icon">
      <slot name="icon" />
    </hbox>
    {#if message}
      <hbox>
        {message}
      </hbox>
    {/if}
    <slot />
  </hbox>
</hbox>

<script lang="ts">
  import Spinner from "./Spinner.svelte";

  export let message: string = null;
  export let status: "success" | "processing" | "error" | "warning" | "" = "";
</script>

<style>
  .status {
    margin-top: 8px;
    margin-bottom: 8px;
  }
  .box {
    border-radius: 15px;
    justify-content: start;
    margin-left: 8px;
    margin-right: 24px;
    padding: 6px 16px 6px 12px;
  }
  .success .box {
    background-color: #E7F9EC;
    color: #0BC241;
    border: 1px solid #0BC241;
  }
  .processing .box {
    background-color: #F0F9F8;
    color: #455468;
    margin-left: 16px;
  }
  .warning .box,
  .error .box {
    background-color: #FFFAEC;
    color: #FFC83A;
    border: 1px solid #FFC83A;
  }
  @media (prefers-color-scheme: dark) {
    .success .box,
    .processing .box,
    .warning .box,
    .error .box {
      background-color: unset;
    }
  }
  .icon {
    margin-right: 8px;
  }
</style>
