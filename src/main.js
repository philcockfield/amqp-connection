import R from "ramda";
import Promise from "bluebird";
import amqp from "amqplib";



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
  if (!(new RegExp("^(amqp|amqps)://", "i").test(url))) {
    throw new Error("A connection url must start with 'amqp://' or 'amqps://'");
  }

  // Create the connection.
  return new Promise((resolve, reject) => {
    amqp.connect(url, socketOptions)
        .then(conn => resolve(conn))
        .then(null, err => reject(err));
  });
};
