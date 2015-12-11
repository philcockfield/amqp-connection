import R from "ramda";
import Promise from "bluebird";
import amqp from "amqplib";
import FakeConnection from "./fakes/FakeConnection";

const CACHE = {};
const FAKE_CONNECTION = new FakeConnection();
const isValidUrl = (url) => new RegExp("^(amqp|amqps)://", "i").test(url);




/**
 * An alternative to the default close method that returns a promise.
 */
const close = (url, conn, closeMethod) => {
  return new Promise(resolve => {
    delete CACHE[url]; // Remove from cache.
    conn.on("close", () => resolve({ url }));
    closeMethod.call(conn);
  });
};


const isPromise = (value) => R.is(Function, value.then);



/**
 * Main entry point to module.
 * Creates or retrieves a cached connection.
 *
 * @param {String} url: The URL to the AMQP/RabbitMQ server.
 *                      Must start with "amqp://"
 *
 * @param {Object} socketOptions: Connection options.
 *                                See: http://www.squaremobius.net/amqp.node/channel_api.html#connect
 * @return {Promise}
 */
const connectionFactory = (url, socketOptions = {}) => {
  // Ensure the URL is adequate.
  if (R.isNil(url) || R.isEmpty(url)) { throw new Error("A url to the AMQP server is required, eg amqp://rabbitmq"); }
  url = url.trim();
  if (!isValidUrl(url)) { throw new Error("A connection url must start with 'amqp://' or 'amqps://'"); }

  return new Promise((resolve, reject) => {

        // Check whether the connection already exists.
        if (connectionFactory.exists(url)) {

          if (isPromise(CACHE[url])) {
            // A connection for the requested URL is currently in the process
            // of being established.  Wait for it to complete...
            CACHE[url].then(conn => resolve(conn));

          } else {
            // Return the existing connection.
            resolve(CACHE[url]);
          }

        } else {

          // Establish a new connection and store it.
          // NOTE: The promise is stored in the cache in case another request
          //       comes in for the same URL prior to the connection opening.
          CACHE[url] = connectionFactory.connect(url, socketOptions)
              .then(conn => {
                    // Store the actual connection in the cache.
                    CACHE[url] = conn;

                    // Swap out the close method to one that returns a promise.
                    const closeMethod = conn.close;
                    conn.close = () => close(url, conn, closeMethod);

                    // Finish up.
                    resolve(conn);
                    return conn;
                })
              .catch(err => reject(err));
        }
  });
};



/**
 * Clears the cache and resets all state.
 */
connectionFactory.reset = () => {
  Object.keys(CACHE).forEach(key => delete CACHE[key]);
};



/**
 * Determines whether a connection for the given URL already exists.
 * @param {String} url: The URL to the AMQP server.
 * @return {Boolean}
 */
connectionFactory.exists = (url) => CACHE[url] !== undefined;




/**
 * TESTING: The low-level connection method.
 *          Swap this out to return a fake connection for testing.
 *
 * @return {Promise} that yeilds an `amqplib` connection.
 */
const connect = (url, socketOptions) => amqp.connect(url, socketOptions);
const fakeConnect = () => new Promise((resolve) => resolve(FAKE_CONNECTION));
connectionFactory.connect = connect;

/**
 * TESTING: Setup the module to return fake connections.
 */
connectionFactory.fake = () => {
    connectionFactory.connect = fakeConnect;
    return FAKE_CONNECTION;
  };

/**
 * TESTING: Restore the module to return real AMQPLib connections.
 */
connectionFactory.real = () => connectionFactory.connect = connect;



// ----------------------------------------------------------------------------

export default connectionFactory;
