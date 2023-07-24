<hbox class="day">
  {day.toLocaleDateString(undefined, { day: "numeric" })}
</hbox>

<script lang="ts">
  export let day: Date
</script>

<style>
  .day {
    border-bottom: 1px dotted grey;
    background-color: rgba(0, 0, 0, 8%);
    padding: 4px 8px;
  }
</style>
