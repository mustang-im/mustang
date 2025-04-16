<Route path="chat/:chatID">
  {ensureLoaded(selectedChat, "/chat/")}
  <ChatM chat={$selectedChat} />
</Route>
<Route path="search">
  <ChatsM doSearch={true} />
</Route>
<Route path="/">
  <ChatsM />
</Route>

<script lang="ts">
  import { selectedChat } from "./selected";
  import { ensureLoaded } from "../Util/svelte";
  import ChatsM from "./ChatsM.svelte";
  import ChatM from "./ChatM.svelte";
  import { Route } from "svelte-navigator";
</script>
