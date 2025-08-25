{#if appGlobal.isMobile}
  <Route path="/">
    <CategoriesM />
  </Route>
  <Route path="/panel/:categoryID" let:params={urlParams}>
    <!--{ensureIDMatch(params?.category, urlParams.categoryID, id => settingsCategories.find(cat => cat.id == id))}-->
    <PanelM category={params?.category ?? $selectedCategory ?? requiredParam()} />
  </Route>
{:else}
  <Route path="/">
    {params?.category ? $selectedCategory = params.category : null, "" }
    <SettingsApp />
  </Route>
{/if}

<script lang="ts">
  import { selectedCategory } from "./Window/selected";
  import { appGlobal } from "../../logic/app";
  import { getParams } from "../AppsBar/selectedApp";
  import SettingsApp from "./Window/SettingsApp.svelte";
  import PanelM from "./Mobile/PanelM.svelte";
  import CategoriesM from "./Mobile/CategoriesM.svelte";
  import { requiredParam } from "../Util/route";
  import { Route, useLocation } from "svelte-navigator";

  $: location = useLocation();
  $: params = getParams($location.state);
</script>
