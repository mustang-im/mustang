<script>
  export let config = {};
  export let canContinue;

  // TODO test it with a real login against the server
  canContinue = config.isComplete();
</script>

<h2>Verifying that the configuration for {config.emailAddress} works</h2>

<style>
  h2 {
    font-size: large;
    font-weight: bold;
  }
</style>
