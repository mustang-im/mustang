import MainWindow from "./MainWindow.svelte";

const app = new MainWindow({
  target: document.body,
  props: {
    name: "Mustang",
  }
});

export default app;
