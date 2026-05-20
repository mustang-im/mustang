<Route path="graph">
  <TopicGraph selectedTopic={$selectedTopic} />
</Route>
  <Route path="page/:topicID" let:params={urlParams}>
  {$selectedTopic = params?.topic ?? appGlobal.topics.find(topic => topic.id == urlParams.topicID) ?? $selectedTopic ?? requiredParam(), ""}
  <TopicPage bind:topic={$selectedTopic} />
</Route>
<Route path="/">
  <TopicApp />
</Route>

<script lang="ts">
  import { selectedTopic } from "./selected";
  import { appGlobal } from "../../logic/app";
  import { getParams } from "../AppsBar/selectedApp";
  import { requiredParam } from "../Util/route";
  import TopicApp from "./TopicApp.svelte";
  import TopicGraph from "./Graph/TopicGraphPane.svelte";
  import TopicPage from "./Page/TopicPage.svelte";
  import { Route, useLocation } from "svelte-navigator";

  $: location = useLocation();
  $: params = getParams($location.state);
</script>
