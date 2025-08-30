<hbox class="app-button app-column">
  <AppButton on:click={onClick} classes={app.id}>
    <AppIcon slot="icon" icon={app.icon} size="24px" />
  </AppButton>
</hbox>

<script lang="ts">
  import { goTo } from "../selectedApp";
  import { MustangApp } from "../MustangApp";
  import AppButton from "../AppButton.svelte";
  import AppIcon from "../AppIcon.svelte";

  export let app: MustangApp
  export let page: string;

  function onClick(event: Event) {
    event.stopPropagation();
    goTo(page, {});
  }
</script>

<style>
  .app-button :global(.app-button) {
    padding: 12px;
    background-color: var(--appbar-bg);
    color: var(--appbar-fg);
  }
</style>
