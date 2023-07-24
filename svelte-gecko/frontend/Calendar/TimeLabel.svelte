<hbox class="time">
  {time.toLocaleTimeString(undefined, { hour: "numeric", minute: "numeric" })}
</hbox>

<script lang="ts">
  export let time: Date
</script>

<style>
  .time {
    margin: -0.8em 8px 0 32px;
  }
</style>
