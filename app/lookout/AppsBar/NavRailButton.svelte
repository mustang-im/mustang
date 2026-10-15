<button class="nav-rail-button" class:selected
  title={app.name}
  aria-label={app.name}
  aria-current={selected ? "page" : undefined}
  on:click={() => catchErrors(onSelect)}>
  <hbox class="icon">
    {#if railIcon}
      <svelte:component this={railIcon} size="20" />
    {:else}
      <AppIcon icon={app.icon} size="20px" />
    {/if}
  </hbox>
  <hbox class="label">{app.name}</hbox>
</button>

<script lang="ts">
  import type { MustangApp } from "../../frontend/AppsBar/MustangApp";
  import { openApp } from "../../frontend/AppsBar/selectedApp";
  import AppIcon from "../../frontend/AppsBar/AppIcon.svelte";
  import { catchErrors } from "../../frontend/Util/error";
  import MailIcon from "lucide-svelte/icons/mail";
  import CalendarIcon from "lucide-svelte/icons/calendar-days";
  import PeopleIcon from "lucide-svelte/icons/users";
  import ChatIcon from "lucide-svelte/icons/message-square";
  import MeetIcon from "lucide-svelte/icons/video";
  import FilesIcon from "lucide-svelte/icons/folder";
  import WebAppsIcon from "lucide-svelte/icons/layout-grid";
  import TopicIcon from "lucide-svelte/icons/hash";
  import SettingsIcon from "lucide-svelte/icons/settings";

  export let app: MustangApp;
  export let selected = false;

  $: railIcon = getRailIcon(app);

  function getRailIcon(app: MustangApp) {
    const icons = {
      mail: MailIcon,
      calendar: CalendarIcon,
      contacts: PeopleIcon,
      chat: ChatIcon,
      meet: MeetIcon,
      files: FilesIcon,
      webapps: WebAppsIcon,
      topic: TopicIcon,
      settings: SettingsIcon,
    };
    return icons[app.id] ?? null;
  }

  function onSelect() {
    openApp(app, app.windowParams);
  }
</script>

<style>
  .nav-rail-button {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: calc(var(--lo-nav-rail-width) - 8px);
    height: 50px;
    padding: 0;
    border: none;
    border-radius: var(--lo-radius-small);
    background-color: transparent;
    color: var(--lo-fg-secondary);
    font-family: inherit;
  }
  .nav-rail-button:hover {
    background-color: var(--lo-hover-bg);
    color: var(--lo-fg);
  }
  .nav-rail-button.selected {
    background-color: var(--lo-pane-bg);
    color: var(--lo-accent-text);
    box-shadow: var(--lo-shadow-card);
  }
  .nav-rail-button.selected::before {
    content: "";
    position: absolute;
    inset-inline-start: -4px;
    top: 14px;
    bottom: 14px;
    width: 3px;
    border-radius: 2px;
    background-color: var(--lo-accent);
  }
  .icon {
    align-items: center;
    justify-content: center;
  }
  .label {
    max-width: 100%;
    margin-block-start: 2px;
    font-size: 10.5px;
    line-height: 13px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .selected .label {
    font-weight: 600;
  }
</style>
