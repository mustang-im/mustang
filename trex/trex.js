var trexThrottleEvent = function(element, type, name) {
    var running = false;
    obj.addEventListener(type, () => {
        if (running) { return; }
        running = true;
        requestAnimationFrame(() => {
            obj.dispatchEvent(new CustomEvent(name));
            running = false;
        });
    });
};

trexThrottleEvent(window, "resize", "throttledResize");
