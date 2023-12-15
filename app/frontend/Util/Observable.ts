import { arrayRemove } from "../../logic/util/util";

export class Observable<T extends Observable<any>> {
  observers: Array<(value: T) => T> = [];
  subscribe(observer: (value: T) => T): () => void {
    this.callObserver(observer);
    this.observers.push(observer);
    let unsubscribe = () => {
      arrayRemove(this.observers, observer);
    }
    return unsubscribe;
  }
  notifyObservers(propertyName?: string) {
    for (let observer of this.observers) {
      this.callObserver(observer);
    }
  }
  private callObserver<T>(observer: (value: T) => T): void {
    try {
      observer(this as any as T);
    } catch (ex) {
      console.error(ex);
    }
  }
}
