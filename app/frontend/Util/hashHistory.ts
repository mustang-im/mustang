// From <https://github.com/mefechoel/svelte-navigator/blob/main/example/custom-hash-history/src/hashHistory.js>
// Copyright (c) 2020 Michel Strelow
// MIT License (MIT)

import { createHashHistory as _createHashHistory } from "history";
import { createHistory, type HistorySource } from "svelte-navigator";

function createHashSource(window?: Window): HistorySource {
	const history = _createHashHistory({ window });
	let listeners = [];

	history.listen(location => {
		if (history.action === "POP") {
			listeners.forEach(listener => listener(location));
		}
	});

	return {
		get location() {
			return history.location;
		},
		addEventListener(name, handler) {
			if (name !== "popstate") return;
			listeners.push(handler);
		},
		removeEventListener(name, handler) {
			if (name !== "popstate") return;
			listeners = listeners.filter(fn => fn !== handler);
		},
		history: {
			get state() {
				return history.location.state;
			},
			pushState(state, title, uri) {
				history.push(uri, state);
			},
			replaceState(state, title, uri) {
				history.replace(uri, state);
			},
			go(to) {
				history.go(to);
			},
		},
	};
}

export function createHashHistory(window?: Window) {
  return createHistory(createHashSource(window));
}
