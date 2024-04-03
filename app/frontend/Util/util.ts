
export function onKeyEnter(event: KeyboardEvent, onEnter: () => void) {
  if (event.key == "Enter") {
    onEnter();
    event.preventDefault();
  }
}
