<hbox class="day">
  {day.toLocaleDateString(undefined, { day: "numeric" })}
  {#if withMonthOnFirst && day.getDate() == 1 ||
          withMonthOnMonday && day.getDay() == 1 }
    <hbox class="month">
      {day.toLocaleDateString(undefined, { month: "short" })}
    </hbox>
  {/if}
</hbox>

<script lang="ts">
  export let day: Date
  export let withMonthOnMonday = true;
  export let withMonthOnFirst = true;
</script>

<style>
  .day {
    border-bottom: 1px dotted grey;
    background-color: rgba(0, 0, 0, 8%);
    padding: 4px 8px;
  }
  .month {
    font-size: 80%;
    align-self: end;
    margin-left: 8px;
  }
</style>
