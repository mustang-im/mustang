<vbox class="island">
  <IslandSwitcher faint={false}>
    <Button
      label={$t`My computer`}
      icon={ComputerIcon}
      iconSize="16px"
      iconOnly={active != FilesView.Harddrive}
      onClick={() => active = FilesView.Harddrive}
      selected={active == FilesView.Harddrive}
      />
    <Button
      label={$t`Cloud storage`}
      icon={CloudIcon}
      iconSize="16px"
      iconOnly={active != FilesView.CloudStorage}
      onClick={() => active = FilesView.CloudStorage}
      selected={active == FilesView.CloudStorage}
      />
    <Button
      label={$t`Persons`}
      icon={PersonIcon}
      classes="vertical"
      iconSize="16px"
      iconOnly={active != FilesView.Person}
      onClick={() => active = FilesView.Person}
      selected={active == FilesView.Person}
      />
      <Button
      label={$t`Projects`}
      icon={ProjectIcon}
      classes="vertical"
      iconSize="16px"
      iconOnly={active != FilesView.Project}
      onClick={() => active = FilesView.Project}
      selected={active == FilesView.Project}
      />
      <Button
      label={$t`Recent`}
      icon={RecentIcon}
      classes="vertical"
      iconSize="16px"
      iconOnly={active != FilesView.Recent}
      onClick={() => active = FilesView.Recent}
      selected={active == FilesView.Recent}
      />
    <Button
      label={$t`Search`}
      icon={SearchIcon}
      iconSize="16px"
      iconOnly={active != FilesView.Search}
      onClick={() => active = FilesView.Search}
      selected={active == FilesView.Search}
      />
  </IslandSwitcher>
</vbox>

<script lang="ts" context="module">
  export enum FilesView {
    Harddrive,
    CloudStorage,
    Person,
    Project,
    Recent,
    Search,
  }
</script>

<script lang="ts">
  import IslandSwitcher from "../../Shared/IslandSwitcher.svelte";
  import Button from "../../Shared/Button.svelte";
  import ComputerIcon from "lucide-svelte/icons/computer";
  import CloudIcon from "lucide-svelte/icons/cloudy";
  import PersonIcon from "lucide-svelte/icons/user";
  import ProjectIcon from "lucide-svelte/icons/boxes";
  import RecentIcon from "lucide-svelte/icons/clock-arrow-down";
  import SearchIcon from "lucide-svelte/icons/search";
  import { t } from "../../../l10n/l10n";

  /** in/out */
  export let active: FilesView;
</script>

<style>
  .island :global(.button .label) {
    max-height: 16px;
    overflow-y: hidden;
    overflow-wrap: anywhere;
    /* max-width: calc((100% - 100px) * 9999); /* px is the minimum width */
  }
</style>
