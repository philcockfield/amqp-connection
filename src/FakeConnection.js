import R from "ramda";
const EVENTS = Symbol("EVENTS");
const delay = (msecs, func) => setTimeout(func, msecs);



/**
 * A fake connection used for testing.
 */
export default class FakeConnection {
  constructor() {
    this[EVENTS] = {};
  }

  on(event, handler) {
    if (R.is(Function, handler)) {
      this[EVENTS][event] = this[EVENTS][event] || [];
      this[EVENTS][event].push(handler);
    }
  }

  close() {
    const handlers = this[EVENTS].close;
    if (handlers) {
      // Simulate delay in closing.
      delay(10, () => {
        handlers.forEach(fn => fn());
      });
    }
  }
};
