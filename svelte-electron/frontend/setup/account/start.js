import MainWindow from "./AccountSetup.svelte";

const app = new MainWindow({
  target: document.body,
  props: {
    name: "New account setup - Mustang",
  }
});

export default app;
