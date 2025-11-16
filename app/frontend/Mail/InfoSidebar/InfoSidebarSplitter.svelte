<hbox class="infobar-splitter">
  {#if isOpen}
    <Splitter name="mail.infobar" initialRightRatio={0.4} rightMinWidth={200}>
      <hbox slot="left">
        <slot name="message" />
        <InfoSidebarSelector {person} {message} bind:app bind:isOpen />
      </hbox>
        <AppContent {app} {person} {message} slot="right" />
    </Splitter>
  {:else}
    <slot name="message" />
    <InfoSidebarSelector {person} {message} bind:app bind:isOpen />
  {/if}
</hbox>

<script lang="ts">
  import { PersonUID } from "../../../logic/Abstract/PersonUID";
  import { EMail } from "../../../logic/Mail/EMail";
  import Splitter from "../../Shared/Splitter.svelte";
  import AppContent from "./AppContent.svelte";
  import InfoSidebarSelector from "./InfoSidebarSelector.svelte";

  /** About which person to show the content - in only */
  export let person: PersonUID;
  /** About which email to show the content - in only */
  export let message: EMail;
  /** Whether to show the content.
   * false = show only selector
   * true = show selector and content
   * out */
  export let isOpen = false;

  let app: any;
</script>

<style>
  .infobar-splitter {
    background-color: var(--leftbar-bg);
    color: var(--leftbar-fg);
  }
</style>
