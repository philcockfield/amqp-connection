import R from "ramda";
import Promise from "bluebird";
import amqp from "amqplib";

const CACHE = {};
const isValidUrl = (url) => new RegExp("^(amqp|amqps)://", "i").test(url);


/**
 * Clears the cache and resets all state.
 */
export const reset = () => {
  Object.keys(CACHE).forEach(key => delete CACHE[key]);
};




/**
 * Main entry point to module.
 * Creates or retrieves a cached connection.
 *
 * @param {string} url: The URL to the AMQP/RabbitMQ server.
 *                      Must start with "amqp://"
 *
 * @param {object} socketOptions: Connection options.
 *                                See: http://www.squaremobius.net/amqp.node/channel_api.html#connect
 * @return {Promise}
 */
export default (url, socketOptions = {}) => {
  // Ensure the URL is adequate.
  if (R.isNil(url) || R.isEmpty(url)) { throw new Error("A url to the AMQP server is required, eg amqp://rabbitmq"); }
  url = url.trim();
  if (!isValidUrl(url)) { throw new Error("A connection url must start with 'amqp://' or 'amqps://'"); }

  return new Promise((resolve, reject) => {
    Promise.coroutine(function*() {

        // Check whether the connection exists.
        if (CACHE[url]) {
          resolve(CACHE[url]);
        } else {
          // Establish the connection.
          try {
            const conn = yield amqp.connect(url, socketOptions);
            CACHE[url] = conn;
            resolve(conn);
          } catch (err) {
            reject(err);
          }
        }

    }).call(this);
  });
};
