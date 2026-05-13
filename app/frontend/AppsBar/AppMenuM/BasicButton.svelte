<RoundButton
  {label} {icon} {onClick}
  classes="plain {classes}"
  iconSize="24px"
  padding="12px"
  border={false}>
  <slot name="icon" slot="icon" />
</RoundButton>

<script lang="ts">
  import { goTo } from "../selectedApp";
  import RoundButton from "../../Shared/RoundButton.svelte";
  import type { ConstructorOfATypedSvelteComponent } from "svelte";

  export let label: string = null;
  export let icon: ConstructorOfATypedSvelteComponent | string = null;
  export let onClick = onClickPage;
  export let page: string | null = null;
  export let params = {};

  export let classes = "";

  function onClickPage() {
    goTo(page, params);
  }
</script>
