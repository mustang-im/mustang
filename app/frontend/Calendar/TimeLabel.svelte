<hbox class="time">
  {time.toLocaleTimeString(undefined, { hour: "numeric" })}
</hbox>

<script lang="ts">
  export let time: Date
</script>

<style>
  .time {
    margin: -0.8em 8px 0 0;
    color: #AAABB4;
    font-weight: 300;
    justify-content: end;
  }
</style>
