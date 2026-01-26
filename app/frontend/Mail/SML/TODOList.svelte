<vbox class="todo">
  <fieldset>
    {#each tasks as task}
      <Checkbox label={task.name} checked={task.actionStatus == TSMLActionStatus.Completed} allowIndetermined allowFalse on:click={() => onCheck(task)} />
      {#if task.description}
        <hbox class="description">{task.description}</hbox>
      {/if}
    {/each}
  </fieldset>
</vbox>

<script lang="ts">
  import { SMLData } from "../../../logic/Mail/SML/SMLData";
  import { TSMLActionStatus, type TSMLAction } from "../../../logic/Mail/SML/TSML";
  import { ensureArray } from "../../../logic/util/util";
  import Checkbox from "../../Shared/Checkbox.svelte";

  export let sml: SMLData;
  export let myReaction: TSMLAction;

  $: todolist = $sml.sml as any as TSMLAction;
  $: tasks = ensureArray(todolist.object) as TSMLAction[];

  function onCheck(task: TSMLAction) {
    task.actionStatus =
      task.actionStatus == TSMLActionStatus.TODO ? TSMLActionStatus.InProgress :
      task.actionStatus == TSMLActionStatus.InProgress ? TSMLActionStatus.Completed :
      task.actionStatus == TSMLActionStatus.Completed ? TSMLActionStatus.Failed :
      TSMLActionStatus.TODO;
  }
</script>

<style>
  fieldset {
    border: none;
    margin: 24px 12px 12px 12px;
  }
</style>
