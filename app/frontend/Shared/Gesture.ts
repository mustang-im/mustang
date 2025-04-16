export enum SwipeDirection {
  Left, Right, Up, Down,
}
/**
 * Usage:
  on:touchstart={ev => swipe.touchStart(ev)}
  on:touchend={ev => swipe.touchEnd(ev)}
  import { Swipe } from "../../Shared/Gesture";
  let swipe = new Swipe();
  swipe.onLeft = onPreviousMessage;
  swipe.onRight = onNextMessage;
 */
export class Swipe {
  startX: number | null = null;
  startY: number | null = null;
  /** Minimal distance in px in the correct direction, otherwise ignore it */
  minCorrectDelta = 50;
  /** If more than this distance in px in the wrong dimension, ignore it */
  maxWrongDelta = 20;

  touchStart(event: TouchEvent) {
    let touch = event.touches[0];
    this.startX = touch.clientX;
    this.startY = touch.clientY;
  }
  touchEnd(event: TouchEvent): SwipeDirection | null {
    let touch = event.touches[0];
    let deltaX = touch.clientX - this.startX;
    let deltaY = touch.clientY - this.startY;
    let direction = this.calculateSwipeDirection(deltaX, deltaY);
    // alert("delta " + deltaX + "," + deltaY + ", direction" + direction);
    if (direction == SwipeDirection.Left) {
      this.onLeft();
    } else if (direction == SwipeDirection.Right) {
      this.onRight();
    } else if (direction == SwipeDirection.Up) {
      this.onUp();
    } else if (direction == SwipeDirection.Down) {
      this.onDown();
    }
    return direction;
  }
  calculateSwipeDirection(deltaX: number, deltaY: number): SwipeDirection | null {
    if (true || -this.maxWrongDelta <= deltaY && deltaY <= this.maxWrongDelta) {
      if (deltaX >= this.minCorrectDelta) {
        return SwipeDirection.Right;
      } else if (deltaX <= -this.minCorrectDelta) {
        return SwipeDirection.Left;
      }
    }
    if (true || -this.maxWrongDelta <= deltaX && deltaX <= this.maxWrongDelta) {
      if (deltaY >= this.minCorrectDelta) {
        return SwipeDirection.Down;
      } else if (deltaY <= -this.minCorrectDelta) {
        return SwipeDirection.Up;
      }
    }
  }

  onLeft = () => null;
  onRight = () => null;
  onUp = () => null;
  onDown = () => null;
}
