// <copied from="../../app/logic/util/Observable.ts" />

export class Observable {
  _observers: Array<observerFunc<any>> = [];
  _properties = {};
  subscribe(observer: observerFunc<this>): () => void {
    this.callObserver(observer, null, null);
    this._observers.push(observer);
    let unsubscribe = () => {
      arrayRemove(this._observers, observer);
    }
    return unsubscribe;
  }
  notifyObservers(propertyName?: string, oldValue?: any): void {
    for (let observer of this._observers) {
      this.callObserver(observer, propertyName, oldValue);
    }
  }
  private callObserver(observer: observerFunc<this>, propertyName: string | null, oldValue: any): void {
    try {
      observer(this, propertyName, oldValue);
    } catch (ex) {
      console.error(ex);
    }
  }
}

export interface IObservable {
  subscribe(observer: observerFunc<this>): () => void;
  notifyObservers(propertyName?: string, oldValue?: any): void;
}
type observerFunc<T> = (object: T, propertyName: string | null, oldValue: any) => void;

/** Decorator for getters/setters.
 * Lets changes call `notifyObservers()`.
 * Setting the already current value is a no-op.
 */
export function notifyChangedAccessor<T extends Observable>(obj: T, propertyName: string, descriptor: PropertyDescriptor) {
  let original = descriptor.set;
  descriptor.set = function (this: T, val: any) {
    let oldValue = this[propertyName];
    if (oldValue === val) {
      return;
    }
    original.call(this, val);
    this.notifyObservers(propertyName, oldValue);
  }
}

/** Decorator for object properties.
 * Lets changes call `notifyObservers()`. */
export function notifyChangedProperty<T extends Observable>(obj: T, propertyName: string) {
  if (!obj._properties) {
    obj._properties = {};
  }
  let descriptor = Object.getOwnPropertyDescriptor(obj, propertyName);
  if (descriptor) {
    assert(descriptor.configurable, `Cannot attach property decorator to .${propertyName}, it's not configurable.`);
    assert(!descriptor.set && !descriptor.get, `.${propertyName} has a getter/setter. Use notifyChangedAccessor() instead.`);
    descriptor.enumerable = true;
    obj._properties[propertyName] = descriptor?.value;
    delete descriptor.value;
    delete descriptor.writable;
  } else {
    descriptor = {
      configurable: true,
      enumerable: true,
    };
  }
  descriptor.set = function (this: T, val: any): void {
    let oldValue = this._properties[propertyName];
    if (oldValue === val) {
      return;
    }
    this._properties[propertyName] = val;
    this.notifyObservers(propertyName, oldValue);
  }
  descriptor.get = function (this: T) {
    return this._properties[propertyName];
  }
  Object.defineProperty(obj, propertyName, descriptor);
}


export function assert(test, errorMessage): asserts test {
  if (!test) {
    throw new Error(errorMessage);
  }
}

export function arrayRemove(array, item) {
  let pos = array.indexOf(item);
  if (pos > -1) {
    array.splice(pos, 1);
  }
}
