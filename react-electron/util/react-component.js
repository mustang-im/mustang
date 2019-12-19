import { assert, Exception, tr, runLater, removeChildElements } from "../util/util";
import gApp from "../app-global.js";
import React, { Component } from 'react';

/**
 * Component that needs to load data asynchronously before it can render.
 *
 * Properties:
 * @param successCallback {Function(ex)}   Called when the component finished loading.
 *     Optional, defaults to no-op.
 * @param errorCallback {Function(ex)}   Called when the component init fails.
 *     Defaults to `gApp.errorCallback(ex)`.
 */
export class LoadingComponent extends Component {
  constructor(props, errorCallback) {
    super(props);
    if (errorCallback) {
      assert(typeof(errorCallback) == "function", "errorCallback: need function");
      this.errorCallbackFromSubclass = errorCallback;
    }

    if (!this.state) { // TODO needed?
      this.state = {};
    }
    this.state.loaded = false;
  }

  errorCallback(ex) {
    var errorCallback = this.props.errorCallback || this.errorCallbackFromSubclass || gApp.errorCallback;
    errorCallback(ex);
  }

  /**
   * This allows you to load data from the network.
   *
   * This will be called whenever the properies or state change.
   * You are advised to cache the data, e.g. in a global/app variable,
   * in case the same data is needed later again.
   */
  async load() {
    // implement this
  }

  renderWhenLoaded() {
    // implement this
  }

  renderWhileLoading() {
    // you may override this function completely
    return null;
  }

  async callLoad() {
    (async () => {
      try {
        await this.load();
        this.state.loaded = true;
        this.setState(this.state);
        if (typeof(this.props.successCallback) == "function") {
          this.props.successCallback();
        }
      } catch (ex) {
        this.errorCallback(ex);
      }
    })();
  }

  async componentWillMount() {
    await this.callLoad();
  }

  async componentDidUpdate(prevProps, prevState) {
    if (propsChanged(this, prevProps) || stateChanged(this, prevState)) {
      await this.callLoad();
    }
  }

  render() {
    // If you do not need to wait for the load before rendering,
    // you may override this function completely
    if (!this.state.loaded) {
      return this.renderWhileLoading();
    }
    return this.renderWhenLoaded();
  }
}

function propsChanged(component, prevProps) {
  for (let propName in prevProps) {
    if (prevProps[propName] != component.props[propName]) {
      return true;
    }
  }
  return false;
}

function stateChanged(component, prevState) {
  for (let stateName in prevState) {
    if (prevState[stateName] != component.state[stateName] &&
        stateName != "loaded") {
      return true;
    }
  }
  return false;
}

/**
 * Component which can raise an error.
 *
 * Properties:
 * @param successCallback {Function}   Called when the action succeeded
 * @param errorCallback {Function(ex)}   Called when the component init
 *     or the successCallback fails.
 *     Defaults to `gApp.errorCallback(ex)`.
 */
export class FailingComponent extends Component {
  constructor(props, successCallback) {
    super(props);
    this.successCallback = successCallback || props.successCallback || (() => null);
    assert(typeof(this.successCallback) == "function", "successCallback: need function");
    this.successCallbackSafe = (arg1, arg2) => {
      try {
        this.successCallback(arg1, arg2);
      } catch (ex) {
        console.error(ex);
        this.errorCallback(ex);
      }
    }
  }

  errorCallback(ex) {
    var errorCallback = this.props.errorCallback || gApp.errorCallback;
    errorCallback(ex);
  }
}

/**
 * Component that renders using DOM elements.
 * Takes care of getting a reference to a DOM element,
 * and re-renders when the properies change
 * (but not when the state changes).
 *
 * Creates a <div>, underneath which you can add your custom
 * DOM elements. It will automatically clear and destroy these
 * DOM elements when a re-rendering is deemed necessary,
 * so you only have to take care of adding your DOM elements,
 * based on the component instance properties.
 *
 * Properties:
 * @param successCallback {Function}   Called when the action succeeded
 * @param errorCallback {Function(ex)}   Called when the DOM creation,
 *     the component init, or the successCallback fails.
 *     Defaults to `gApp.errorCallback(ex)`.
 */
export class DOMComponent extends FailingComponent {
  /**
   * @param className {String}    A CSS class, so that your CSS can put a default size on it,
   *      to reduce moving the page after load.
   * @param successCallback {Function} (Optional)   Can be overridden by the property
   */
  constructor(props, className, successCallback) {
    super(props, successCallback);

    this.domRootRef = React.createRef();
    this.className = className || "domComponent";
  }

  render() {
    return (
      <div className={ this.className } ref={ this.domRootRef } />
    );
  }

  /**
   * This will be called whenever the properties change.
   * The |rootElement| is just a <div>, underneath which
   * you add your custom DOM elements.
   * Do not change the <div> itself.
   */
  async createDOM(rootElement) {
    // implement this
  }

  clearDOM() {
    let rootElement = this.domRootRef.current;
    removeChildElements(rootElement);
  }

  async callCreate() {
    try {
      this.clearDOM();
      let rootElement = this.domRootRef.current;
      await this.createDOM(rootElement);
    } catch (ex) {
      this.errorCallback(ex);
    }
  }

  async componentDidMount() {
    await this.callCreate();
  }

  async componentDidUpdate(prevProps, prevState) {
    if (propsChanged(this, prevProps)) {
      await this.callCreate();
    }
  }
}

/**
 * Component which can raise an error.
 *
 * Properties:
 * @param ms {Integer}   Time in milliseconds. How long to delay the load.
 * @param children
 */
export class DelayLoad extends LoadingComponent {
  constructor(props) {
    assert(typeof(props.ms) == "number", "ms: need time in ms");
    assert(props.children, "need children, otherwise there's nothing to delay load, is there?");
    super(props);
  }

  async load() {
    await runLater(this.props.ms);
  }

  renderWhenLoaded() {
    return this.props.children;
  }
}
