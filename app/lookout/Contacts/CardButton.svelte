{#if href}
  <a class="card-button-link" {href} tabindex="-1">
    <Button {label} {icon} classes="card-button" />
  </a>
{:else}
  <Button {label} {icon} {onClick} {disabled} classes="card-button" />
{/if}

<script lang="ts">
  import Button from "../../frontend/Shared/Button.svelte";

  export let label: string;
  export let icon: ConstructorOfATypedSvelteComponent;
  export let onClick: () => void | Promise<void> = null;
  export let href: string = null;
  export let disabled: boolean | string = false;
</script>

<style>
  .card-button-link {
    text-decoration: none;
  }
  :global(button.button.card-button) {
    height: 32px;
    padding: 0 12px;
    border: 1px solid var(--lo-border);
    border-radius: var(--lo-radius-small);
    background-color: var(--lo-pane-bg);
    color: var(--lo-fg);
    font: inherit;
    white-space: nowrap;
  }
  :global(button.button.card-button .gap) {
    width: 6px;
  }
  :global(button.button.card-button .icon) {
    color: var(--lo-accent-text);
  }
  :global(button.button.card-button:hover:not(.disabled)) {
    border-color: var(--lo-border-strong);
    background-color: var(--lo-hover-bg);
  }
  :global(button.button.card-button.disabled) {
    opacity: 1;
    color: var(--lo-fg-disabled);
  }
  :global(button.button.card-button.disabled .icon) {
    color: var(--lo-fg-disabled);
  }
</style>
