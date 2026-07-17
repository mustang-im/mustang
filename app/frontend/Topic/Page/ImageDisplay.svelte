<vbox class="image">
  <img src={image.src} alt={image.description} />
</vbox>

<script lang="ts">
  import { Image } from "../../../logic/Topic/PageContent";
  import { Topic } from "../../../logic/Topic/Topic";

  export let topic: Topic;
  export let image: Image;
</script>

<style>
</style>
