var trexThrottleEvent = function(element, type, name) {
    var running = false;
    element.addEventListener(type, () => {
        if (running) { return; }
        running = true;
        requestAnimationFrame(() => {
            element.dispatchEvent(new CustomEvent(name));
            running = false;
        });
    });
};

trexThrottleEvent(window, "resize", "throttledResize");
