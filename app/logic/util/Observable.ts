import { arrayRemove, assert } from "./util";

export class Observable<T extends Observable<T>> {
  _observers: Array<observerFunc<T>> = [];
  _properties = {};
  subscribe(observer: observerFunc<T>): () => void {
    this.callObserver(observer);
    this._observers.push(observer);
    let unsubscribe = () => {
      arrayRemove(this._observers, observer);
    }
    return unsubscribe;
  }
  notifyObservers(propertyName?: string) {
    for (let observer of this._observers) {
      this.callObserver(observer);
    }
  }
  private callObserver<T>(observer: observerFunc<T>): void {
    try {
      observer(this as any as T);
    } catch (ex) {
      console.error(ex);
    }
  }
}

type observerFunc<T> = (value: T) => void;

/** Decorator for getters/setters.
 * Lets changes call `notifyObservers()`.
 * Setting the already current value is a no-op.
 */
export function notifyChangedAccessor<T extends Observable<T>>(obj: T, propertyName: string, descriptor: PropertyDescriptor) {
  let original = descriptor.set;
  descriptor.set = function (this: T, val: any) {
    if (this[propertyName] === val) {
      return;
    }
    original.call(this, val);
    this.notifyObservers(propertyName);
  }
}

/** Decorator for object properties.
 * Lets changes call `notifyObservers()`. */
export function notifyChangedProperty<T extends Observable<T>>(obj: T, propertyName: string) {
  if (!obj._properties) {
    obj._properties = {};
  }
  let descriptor = Object.getOwnPropertyDescriptor(obj, propertyName);
  if (descriptor) {
    assert(descriptor, `Property descriptor for property .${propertyName} doesn't exist`);
    assert(descriptor.configurable, `Cannot attach property decorator to .${propertyName}, it's not configurable.`);
    assert(!descriptor.set && !descriptor.get, `.${propertyName} has a getter/setter. Use notifyChangedAccessor() instead.`);
    descriptor.enumerable = true;
    this._properties[propertyName] === descriptor?.value;
    delete descriptor.value;
    delete descriptor.writable;
  } else {
    descriptor = {
      configurable: true,
      enumerable: true,
    };
  }
  descriptor.set = function (this: T, val: any): void {
    if (this._properties[propertyName] === val) {
      return;
    }
    this._properties[propertyName] = val;
    this.notifyObservers(propertyName);
  }
  descriptor.get = function (this: T) {
    return this._properties[propertyName];
  }
  Object.defineProperty(obj, propertyName, descriptor);
}
