<SubMenu {label} {icon} {disabled} {tooltip}>
  <slot />
</SubMenu>

<script lang="ts">
  import SubMenu from "../../Shared/Menu/SubMenu.svelte";

  export let label: string;
  export let icon: ConstructorOfATypedSvelteComponent = null;
  export let disabled: boolean | string = false;
  export let tooltip: string = null;
</script>
