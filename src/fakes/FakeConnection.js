import R from 'ramda';
import Promise from 'bluebird';
import { delay } from '../util';
import FakeChannel from './FakeChannel';

const EVENTS = Symbol('EVENTS');


/**
 * A fake connection used for testing.
 *
 * See: http://www.squaremobius.net/amqp.node/channel_api.html#connect
 */
export default class FakeConnection {
  constructor() {
    this[EVENTS] = {};

    // Store test values for inspection by unit-tests.
    this.test = {
      channels: [],
    };
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
    const channel = new FakeChannel();
    this.test.channels.push(channel);
    return new Promise((resolve) => {
      delay(1, () => resolve(channel));
    });
  }
}
