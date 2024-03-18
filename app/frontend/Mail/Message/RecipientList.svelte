<hbox class="list">
  {#each recipients.each as to, i}
    {#if i > 0}
      <hbox class="comma">,</hbox>
    {/if}
    <Recipient recipient={to} />
  {/each}
</hbox>

<script lang="ts">
  import type { Collection } from "svelte-collections";
  import type { PersonEmailAddress } from "../../../logic/Mail/EMail";
  import Recipient from "./Recipient.svelte";

  export let recipients: Collection<PersonEmailAddress>;
</script>

<style>
  .list {
    flex-wrap: wrap;
    max-height: 3em;
    overflow-y: hidden;
  }
  .comma {
    margin-right: 0.3em;
  }
</style>
