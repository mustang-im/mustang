<hbox class="identity-selector">
  <select bind:value={selectedIdentity}>
    {#each $identities.each as identity }
      <option value={identity}>
        {identity.name}
      </option>
    {/each}
  </select>
</hbox>

<script lang="ts">
  import type { MailIdentity } from "../../../logic/Mail/MailIdentity";
  import { ArrayColl, type Collection } from "svelte-collections";
  import { appGlobal } from "../../../logic/app";

  export let selectedIdentity: MailIdentity; /* in/out */
   /** Which identities to select from.
    * Default: all identities of all accounts
    * in */
  export let identities: Collection<MailIdentity> = new ArrayColl(appGlobal.emailAccounts.contents.map(acc => acc.identities.contents).flat());
</script>

<style>
  .identity-selector :global(select) {
    border: none;
    color: inherit;
    background-color: transparent;
  }
</style>
