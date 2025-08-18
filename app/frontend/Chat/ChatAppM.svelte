<Splitter name="persons-list" initialRightRatio={4}>
  <ChatsM slot="left" />
  <ChatM chat={$selectedChat} slot="right" />
</Splitter>

<script lang="ts">
  import { selectedChat } from "./selected";
  import Splitter from "../Shared/Splitter.svelte";
  import ChatsM from "./ChatsM.svelte";
  import ChatM from "./ChatM.svelte";
</script>
