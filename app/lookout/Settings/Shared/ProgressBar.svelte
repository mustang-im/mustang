<div class="progress-bar" role="progressbar" aria-label={label}><div class="progress-value" /></div>

<script lang="ts">
  export let label: string = null;
</script>

<style>
  .progress-bar {
    position: relative;
    height: 4px;
    overflow: hidden;
    border-radius: 2px;
    background-color: var(--lo-divider);
  }
  .progress-value {
    position: absolute;
    width: 30%;
    height: 100%;
    background-color: var(--lo-accent);
    animation: progress 1.4s ease-in-out infinite;
  }
  @keyframes progress {
    from { left: -30%; }
    to { left: 100%; }
  }
</style>
