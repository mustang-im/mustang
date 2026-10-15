import type { Event } from "../../../logic/Calendar/Event";
import { selectedEvent } from "../../../frontend/Calendar/selected";
import { catchErrors } from "../../../frontend/Util/error";
import { CalendarActions } from "../CalendarActions";
import { eventPeek, selectedSlots, type CalendarMenus } from "../Selected";
import type { EventDrag } from "../TimeGrid/EventDrag";

export interface EventInteractionParams {
  event: Event;
  menus: CalendarMenus;
  startDrag?: (pointerEvent: PointerEvent) => EventDrag | null;
}

export class EventInteraction {
  static attach(element: HTMLElement, params: EventInteractionParams) {
    let current = params;
    let select = () => {
      selectedEvent.set(current.event);
      selectedSlots.set(null);
    };
    let drag: EventDrag | null = null;
    let wasDragged = false;
    let onClick = (mouseEvent: MouseEvent) => {
      mouseEvent.stopPropagation();
      if (wasDragged) {
        wasDragged = false;
        return;
      }
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
    let onPointerDown = (pointerEvent: PointerEvent) => {
      pointerEvent.stopPropagation();
      CalendarActions.commitInlineTitle();
      wasDragged = false;
      if (pointerEvent.button != 0 || !current.startDrag) {
        return;
      }
      drag = current.startDrag(pointerEvent);
      if (drag) {
        element.setPointerCapture(pointerEvent.pointerId);
      }
    };
    let onPointerMove = (pointerEvent: PointerEvent) => {
      if (!drag) {
        return;
      }
      drag.move(pointerEvent);
      if (drag.hasMoved) {
        element.classList.add("dragging");
        eventPeek.set(null);
        drag.preview(element);
      }
    };
    let endDrag = (): EventDrag | null => {
      let finishedDrag = drag;
      drag = null;
      finishedDrag?.endPreview(element);
      element.classList.remove("dragging");
      return finishedDrag;
    };
    let onPointerCancel = () => {
      endDrag();
    };
    let onPointerUp = () => {
      let finishedDrag = endDrag();
      if (!finishedDrag?.hasMoved) {
        return;
      }
      wasDragged = true;
      if (finishedDrag.changesTime) {
        let { start, end } = finishedDrag.newTimes();
        catchErrors(() => CalendarActions.changeTime(current.event, start, end));
      }
    };
    element.addEventListener("click", onClick);
    element.addEventListener("dblclick", onDoubleClick);
    element.addEventListener("contextmenu", onContextMenu);
    element.addEventListener("keydown", onKeyDown);
    element.addEventListener("focus", onFocus);
    element.addEventListener("pointerdown", onPointerDown);
    element.addEventListener("pointermove", onPointerMove);
    element.addEventListener("pointerup", onPointerUp);
    element.addEventListener("pointercancel", onPointerCancel);
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
        element.removeEventListener("pointermove", onPointerMove);
        element.removeEventListener("pointerup", onPointerUp);
        element.removeEventListener("pointercancel", onPointerCancel);
      },
    };
  }
}
