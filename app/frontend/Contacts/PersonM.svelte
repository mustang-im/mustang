<vbox flex class="pane">
  {#if person && person instanceof Person}
    <Scroll>
      <NameBox {person} />
      <ContactBoxes {person} />
    </Scroll>
  {/if}
</vbox>
{#if $appGlobal.isMobile}
  <PersonBarM {person} />
{/if}

<script lang="ts">
  import { Person } from "../../logic/Abstract/Person";
  import { appGlobal } from "../../logic/app";
  import NameBox from "./NameBox.svelte";
  import ContactBoxes from "./ContactBoxes.svelte";
  import PersonBarM from "./PersonBarM.svelte";
  import Scroll from "../Shared/Scroll.svelte";

  export let person: Person;
</script>

<style>
  .pane {
    background: url(../asset/background-repeat.png) repeat;
    background-color: var(--main-pattern-bg);
    background-blend-mode: soft-light;
    color: var(--main-pattern-fg);
  }
</style>
