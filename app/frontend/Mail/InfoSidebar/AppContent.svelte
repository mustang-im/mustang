<vbox class="app-content" flex>
  {#if app == "history"}
    <History {person} {message} />
  {/if}
</vbox>

<script lang="ts">
  import { PersonUID } from "../../../logic/Abstract/PersonUID";
  import { EMail } from "../../../logic/Mail/EMail";
  import History from "./App/History.svelte";

  /** which person the content is about - in only */
  export let person: PersonUID;
  /** which email the content is about - in only */
  export let message: EMail;
  /** selected app - in only */
  export let app: any;
</script>

<style>
  .app-content {
    background-color: white;
  }
</style>
