<IslandSwitcher>
  <Button
    label={$t`Folders`}
    icon={FolderIcon}
    iconOnly
    iconSize="16px"
    onClick={() => active = SearchView.Folder}
    selected={active == SearchView.Folder}
    />
  <Button
    label={$t`Persons`}
    icon={PersonIcon}
    classes="vertical"
    iconOnly
    iconSize="16px"
    onClick={() => active = SearchView.Person}
    selected={active == SearchView.Person}
    />
  <Button
    label={$t`Search`}
    icon={SearchIcon}
    iconOnly
    iconSize="16px"
    onClick={() => active = SearchView.Search}
    selected={active == SearchView.Search}
    />
</IslandSwitcher>

<script lang="ts" context="module">
  export enum SearchView {
    Folder,
    Person,
    Search,
  }
</script>

<script lang="ts">
  import IslandSwitcher from "../../Shared/IslandSwitcher.svelte";
  import Button from "../../Shared/Button.svelte";
  import FolderIcon from "lucide-svelte/icons/folder";
  import PersonIcon from "lucide-svelte/icons/user";
  import SearchIcon from "lucide-svelte/icons/search";
  import { t } from "../../../l10n/l10n";

  /** in/out */
  export let active: SearchView;
</script>
