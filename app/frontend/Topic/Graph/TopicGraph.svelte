<vbox class="topic-graph" flex>
  <Scroll>
    <TopicTreeBranch topic={rootTopic} bind:selectedTopic />
  </Scroll>
</vbox>

<script lang="ts">
  import { rootTopic } from "../../../logic/Topic/TopicAccounts";
  import Scroll from "../../Shared/Scroll.svelte";
  import TopicTreeBranch from "./TopicTreeBranch.svelte";

  /** in/out */
  export let selectedTopic = rootTopic;

  $: if (selectedTopic == rootTopic) { selectedTopic = null; }
</script>

<style>
  .topic-graph {
    padding: 6px 24px 6px 12px;
    background-color: var(--leftbar-bg);
    color: var(--leftbar-fg);
  }
</style>
