<hbox class="app-menu-button {app}" on:swipeup={onOpen}>
  <RoundButton
    icon={logo}
    iconSize="32px"
    label="Switch apps"
    classes="plain small"
    border={false}
    padding="6px"
    {onClick}
    />
</hbox>

<script lang="ts">
  import { goTo } from "../selectedApp";
  import RoundButton from "../../Shared/RoundButton.svelte";
  import logo from '../../asset/icon/general/logo.svg?raw';

  export let onClick = onOpen;

  $: app = window.location.pathname.split("/")[1] || "none";
  $: console.log(window.location.pathname.split("/"));

  function onOpen() {
    goTo("/app-menu/", {});
  }
</script>

<style>
  .app-menu-button {
    align-items: center;
    justify-content: center;
    width: 42px;
    height: 42px;
    margin: 1px;
    padding: 2px;
  }
  .mail :global(svg path.mail) {
    fill: var(--icon-primary);
  }
  .chat :global(svg path.chat) {
    fill: var(--icon-primary);
  }
  .meet :global(svg path.meet) {
    fill: var(--icon-primary);
  }
  .contacts :global(svg path.contacts) {
    fill: var(--icon-primary);
  }
  .calendar :global(svg path.calendar) {
    fill: var(--icon-primary);
  }
  .files :global(svg path.files) {
    fill: var(--icon-primary);
  }
  .webapps :global(svg path.webapps) {
    fill: var(--icon-primary);
  }
</style>
