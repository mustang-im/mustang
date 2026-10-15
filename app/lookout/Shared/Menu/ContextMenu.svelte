<Menu bind:isMenuOpen anchor={pointerAnchor} placement="right-start">
  <slot />
</Menu>

<script lang="ts">
  import Menu from "../../../frontend/Shared/Menu/Menu.svelte";

  let isMenuOpen = false;
  let pointerAnchor: any;
  export function onContextMenu(event: MouseEvent) {
    let pointer = new DOMRect(event.clientX, event.clientY, 0, 0);
    pointerAnchor = {
      getBoundingClientRect: () => pointer,
    };
    isMenuOpen = true;
  }
</script>
