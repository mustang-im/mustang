<RoundButton
  {label} {icon} onClick={myOnClick}
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

  async function myOnClick(event: Event) {
    event.stopPropagation();
    await onClick();
  }

  function onClickPage() {
    goTo(page, params);
  }
</script>
