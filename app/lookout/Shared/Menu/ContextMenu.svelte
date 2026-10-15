<Menu bind:isMenuOpen anchor={pointerAnchor} placement="right-start">
  <slot />
</Menu>

<script lang="ts">
  import Menu from "./Menu.svelte";

  export let isMenuOpen = false;

  let pointerAnchor: HTMLElement;
  export function onContextMenu(event: MouseEvent) {
    let pointer = new DOMRect(event.clientX, event.clientY, 0, 0);
    pointerAnchor = {
      getBoundingClientRect: () => pointer,
    } as HTMLElement;
    isMenuOpen = true;
  }
</script>
