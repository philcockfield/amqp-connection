import R from "ramda";
import Promise from "bluebird";
import { delay } from "../util";
import FakeChannel from "./FakeChannel";

const EVENTS = Symbol("EVENTS");


/**
 * A fake connection used for testing.
 *
 * See: http://www.squaremobius.net/amqp.node/channel_api.html#connect
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

  createChannel() {
    return new Promise((resolve, reject) => {
      delay(1, () => resolve(new FakeChannel()))
    });
  }
};
