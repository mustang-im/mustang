<!-- svelte-ignore a11y-click-events-have-key-events -->
<hbox class="app-object" on:click={() => catchErrors(() => openUIFor(obj))}>
  <slot />
</hbox>

<script lang="ts">
  import { openUIFor } from "./changeTo";
  import type { Observable } from "../../logic/util/Observable";
  import { catchErrors } from "../Util/error";

  export let obj: Observable;
</script>

<style>
  .app-object {
    cursor: pointer;
  }
</style>
