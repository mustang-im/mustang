<vbox flex class="pane">
  {#if person && person instanceof Person}
    <Scroll>
      <PersonDetails {person} />
    </Scroll>
  {/if}
</vbox>
{#if $appGlobal.isMobile}
  <PersonBarM selectedAddressbook={person?.addressbook} />
{/if}

<script lang="ts">
  import { Person } from "../../logic/Abstract/Person";
  import { appGlobal } from "../../logic/app";
  import PersonDetails from "./PersonDetails.svelte";
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
