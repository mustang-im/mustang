{#if appGlobal.isMobile}
  <ContactsAppM />
{:else}
  <ContactsAppD />
{/if}

<script lang="ts">
  import { appGlobal } from "../../logic/app";
  import ContactsAppD from "./ContactsAppD.svelte";
  import ContactsAppM from "./ContactsAppM.svelte";
</script>
