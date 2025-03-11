<hbox class="app-object" on:click={() => catchErrors(onOpen)}>
  <slot />
</hbox>

<script lang="ts">
  import { openUIFor } from "./changeTo";
  import type { Observable } from "../../logic/util/Observable";
  import { catchErrors } from "../Util/error";

  export let obj: Observable;
  export let createObject: () => Observable | null = null;

  function onOpen() {
    if (typeof(createObject) == "function") {
      obj = createObject();
    }
    openUIFor(obj);
  }
</script>

<style>
  .app-object {
    cursor: pointer;
  }
</style>
