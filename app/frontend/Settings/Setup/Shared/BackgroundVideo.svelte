<video class="background-video" autoplay loop muted poster={fallbackPicURL}>
  <source src={videoURL} type="video/mp4">
</video>

<script lang="ts">
  let videoURL: string = "https://www.mustang.im/videos/ocean-birds.mp4";
  let fallbackPicURL: string = ""; // "https://www.mustang.im/videos/ocean-birds.jpg";
</script>

<style>
  .background-video {
    width: 100vw;
    height: 100vh;
    object-fit: cover;
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    z-index: -1;
  }
</style>
