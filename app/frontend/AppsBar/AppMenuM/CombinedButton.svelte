<RoundButton
  onClick={onClick}
  classes="plain"
  border={false}
  padding="24px"
  >
  <hbox class="stack" slot="icon">
    <Stack>
      <hbox class="icon1" flex>
        <AppIcon icon={icon1} size="24px" />
      </hbox>
      <hbox class="icon2" flex>
        <AppIcon icon={icon2} size="24px" />
      </hbox>
    </Stack>
  </hbox>
</RoundButton>

<script lang="ts">
  import { goTo } from "../selectedApp";
  import Stack from "../../Shared/Stack.svelte";
  import AppIcon from "../AppIcon.svelte";
  import RoundButton from "../../Shared/RoundButton.svelte";

  export let icon1: ConstructorOfATypedSvelteComponent | string;
  export let icon2: ConstructorOfATypedSvelteComponent | string;
  export let onClick = onClickPage;
  export let page: string | null = null;
  export let params = {};

  function onClickPage() {
    goTo(page, params);
  }
</script>

<style>
  .stack :global(.stack) {
    width: 40px;
    height: 40px;
  }
  .icon1 {
    align-items: center;
    justify-content: center;
  }
  .icon1,
  .icon1 :global(.cls-1),
  .icon1 :global(.cls-2),
  .icon1 :global(.cls-3) {
    stroke: var(--button-border);
  }
  .icon1 :global(.date-calendar-icon) {
    display: none;
  }
  .icon2 {
    align-items: start;
    justify-content: end;
    color: var(--fg);
  }
  .icon2 :global(svg) {
    fill: var(--bg);
  }
</style>
