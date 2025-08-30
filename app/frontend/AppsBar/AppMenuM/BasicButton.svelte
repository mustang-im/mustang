<RoundButton
  {label} {icon} {onClick}
  classes="plain {classes}"
  iconSize="24px"
  padding="24px"
  border={false}>
  <slot name="icon" slot="icon" />
</RoundButton>

<script lang="ts">
  import RoundButton from "../../Shared/RoundButton.svelte";
  import type { ComponentType } from "svelte";

  export let label: string = null;
  export let icon: ComponentType | string = null;
  export let onClick: (event: Event) => void = null;
  export let classes = "";
</script>
