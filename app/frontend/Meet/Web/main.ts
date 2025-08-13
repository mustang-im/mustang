import MeetWeb from './MeetWeb.svelte';
import '../../app.css';

const app = new MeetWeb({
  target: document.getElementById('app'),
});

export default app;
