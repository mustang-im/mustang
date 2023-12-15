import './app.css';
import MainWindow from './MainWindow/MainWindow.svelte';

const app = new MainWindow({
  target: document.getElementById('app'),
});

export default app;
