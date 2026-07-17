import { mount } from 'svelte';
import MeetWeb from './MeetWeb.svelte';
import '../../app.css';

const app = mount(MeetWeb, {
  target: document.getElementById('app'),
});

export default app;
