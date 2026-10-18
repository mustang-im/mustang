<hbox class="app-button-wrapper {app.id}">
  <AppButton on:click={onClick} classes="center-bar {app.id}" padding={false}>
    <AppIcon slot="icon" icon={app.icon} size="28px" />
  </AppButton>
</hbox>

<script lang="ts">
  import { getNavigation } from "../selectedApp";
  import { MustangApp } from "../MustangApp";
  import AppButton from "../AppButton.svelte";
  import AppIcon from "../AppIcon.svelte";

  const { goTo } = getNavigation();

  export let app: MustangApp
  export let page: string;
  export let params = {};

  function onClick(event: Event) {
    event.stopPropagation();
    goTo(page, params);
  }
</script>

<style>
  .app-button-wrapper :global(.app-button) {
    background-color: var(--appbar-bg);
    color: var(--appbar-fg);
  }
</style>
