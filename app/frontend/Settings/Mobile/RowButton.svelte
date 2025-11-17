<hbox class="row-button">
  <Button
    icon={icon}
    {onClick}
    classes="plain category-button"
  >
    <hbox class="content" slot="label" flex>
      <hbox class="label font-normal">
        {label}
      </hbox>
      <hbox flex />
      <hbox class="go-icon">
        <GoIcon size="24px"/>
      </hbox>
    </hbox>
  </Button>
</hbox>

<script lang="ts">
  import Button from "../../Shared/Button.svelte";
  import GoIcon from "lucide-svelte/icons/chevron-right";
  import type { ComponentType } from "svelte";

  export let label: string;
  export let icon: ComponentType | string | null = null;
  export let onClick: (event: Event) => void;
</script>

<style>
  .row-button :global(button.category-button) {
    background-color: var(--bg);
    color: var(--fg);
    border: none;
    margin: 4px 0px;
    padding: 12px 24px;
    width: 100%;
    max-width: 20em;
  }
  .content {
    align-items: center;
  }
  .label {
    font-weight: 500;
  }
  .go-icon {
    opacity: 40%;
  }
  :global(.ios) .row-button :global(button) {
    border-radius: 100px;
  }
</style>
