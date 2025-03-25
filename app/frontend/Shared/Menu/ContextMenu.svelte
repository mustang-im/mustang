<Menu bind:isMenuOpen anchor={contextMenuAnchor} placement="bottom-start">
  <slot />
</Menu>

<script lang="ts">
  import Menu from "./Menu.svelte";

  let isMenuOpen = false;
  let contextMenuAnchor: any;
  export function onContextMenu(event: MouseEvent) {
    contextMenuAnchor = {
      getBoundingClientRect() {
        return {
          width: 0,
          height: 0,
          top: event.clientY,
          right: event.clientX,
          bottom: event.clientY,
          left: event.clientX,
        };
      },
    };
    isMenuOpen = true;
  }
</script>
