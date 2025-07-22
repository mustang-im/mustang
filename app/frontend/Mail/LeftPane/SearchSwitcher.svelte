<IslandSwitcher faint={active == SearchView.Folder}>
  <Button
    tooltip={$t`Inbox`}
    label={$t`Inbox *=> Mail folder where new mail arrives. The translation of "Inbox" MUST be less than 7 characters long.`.substring(0, 7)}
    icon={FolderIcon}
    iconOnly={active == SearchView.Folder}
    iconSize="16px"
    onClick={() => active = SearchView.Folder}
    selected={active == SearchView.Folder}
    />
  <Button
    label={$t`Persons`}
    icon={PersonIcon}
    classes="vertical"
    iconSize="16px"
    iconOnly={active != SearchView.Person}
    onClick={() => active = SearchView.Person}
    selected={active == SearchView.Person}
    />
  <Button
    label={$t`Search`}
    icon={SearchIcon}
    iconSize="16px"
    iconOnly={active != SearchView.Search}
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
