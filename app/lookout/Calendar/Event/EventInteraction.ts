import type { Event } from "../../../logic/Calendar/Event";
import { selectedEvent } from "../../../frontend/Calendar/selected";
import { catchErrors } from "../../../frontend/Util/error";
import { CalendarActions } from "../CalendarActions";
import { eventPeek, selectedSlots, type CalendarMenus } from "../Selected";

export interface EventInteractionParams {
  event: Event;
  menus: CalendarMenus;
}

export class EventInteraction {
  static attach(element: HTMLElement, params: EventInteractionParams) {
    let current = params;
    let select = () => {
      selectedEvent.set(current.event);
      selectedSlots.set(null);
    };
    let onClick = (mouseEvent: MouseEvent) => {
      mouseEvent.stopPropagation();
      select();
      eventPeek.set({ event: current.event, anchor: element });
    };
    let onDoubleClick = (mouseEvent: MouseEvent) => {
      mouseEvent.stopPropagation();
      eventPeek.set(null);
      catchErrors(() => CalendarActions.open(current.event));
    };
    let onContextMenu = (mouseEvent: MouseEvent) => {
      mouseEvent.preventDefault();
      mouseEvent.stopPropagation();
      select();
      eventPeek.set(null);
      current.menus.openEventMenu(mouseEvent, current.event);
    };
    let onKeyDown = (keyEvent: KeyboardEvent) => {
      if (keyEvent.key == "Enter") {
        keyEvent.preventDefault();
        keyEvent.stopPropagation();
        eventPeek.set(null);
        catchErrors(() => CalendarActions.open(current.event));
      } else if (keyEvent.key == " ") {
        keyEvent.preventDefault();
        select();
        eventPeek.set({ event: current.event, anchor: element });
      }
    };
    let onFocus = () => select();
    let onPointerDown = (pointerEvent: PointerEvent) => pointerEvent.stopPropagation();
    element.addEventListener("click", onClick);
    element.addEventListener("dblclick", onDoubleClick);
    element.addEventListener("contextmenu", onContextMenu);
    element.addEventListener("keydown", onKeyDown);
    element.addEventListener("focus", onFocus);
    element.addEventListener("pointerdown", onPointerDown);
    return {
      update(newParams: EventInteractionParams) {
        current = newParams;
      },
      destroy() {
        element.removeEventListener("click", onClick);
        element.removeEventListener("dblclick", onDoubleClick);
        element.removeEventListener("contextmenu", onContextMenu);
        element.removeEventListener("keydown", onKeyDown);
        element.removeEventListener("focus", onFocus);
        element.removeEventListener("pointerdown", onPointerDown);
      },
    };
  }
}
