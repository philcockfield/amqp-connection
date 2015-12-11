import Promise from "bluebird";
import { delay } from "../util";


/**
 * A fake {Channel} used for testing.
 *
 * See: http://www.squaremobius.net/amqp.node/channel_api.html#channel
 *
 */
export default class FakeChannel {
  constructor() {
    this.test = {
      assertExchange: [],
      assertQueue: [],
      publish: []
    };
  }

  assertExchange(exchange, type, options) {
    // http://www.squaremobius.net/amqp.node/channel_api.html#channel_assertExchange
    this.test.assertExchange.push({ exchange, type, options });
    return new Promise((resolve) => {
      delay(1, () => resolve(true));
    });
  }


  assertQueue(queue, options) {
    // http://www.squaremobius.net/amqp.node/channel_api.html#channel_assertQueue
    this.test.assertQueue.push({ queue, options });
    return new Promise((resolve) => {
      resolve({
        queue : queue || "amq.auto-generated",
        messageCount: 0,
        consumerCount: 0
      });
    });
  }


  publish(exchange, routingKey, content, options) {
    // http://www.squaremobius.net/amqp.node/channel_api.html#channel_publish
    this.test.publish.push({ exchange, routingKey, content, options });
    return true;
  }
}
