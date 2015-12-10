# mq-connection

![Build Status](https://travis-ci.org/philcockfield/mq-connection.svg)

Cached, idempotent connections to an AMQP/RabbitMQ server.

---
RabbitMQ `connections` are expensive to create and destroy.  You want avoid having too many open connections, in contrast to `channels` which you can (and should) have many of over a single open channel ([ref](http://derickbailey.com/2014/03/26/2-lessons-learned-and-3-resources-for-for-learning-rabbitmq-on-nodejs/)).

This module allows you to work with a single cached connection for each URL.  This is useful when you are employing different modules that connect to RabbitMQ, and don't wish to explicitly pass connections around between API's.


## Installation

    npm install --save mq-connection


## Usage
```js
import connect from "mq-connection";

connect("amqp://rabbitmq")
  .then(connection => {
    // An `amqplib` connection object is returned.
  });

connect("amqp://rabbitmq")
  .then(connection => {
    // This `connection` is the same (cached) connection that was returned above.
  });

```

The `amqp` connection that is returned has a modified `close()` method that returns a promise, allowing you to determine exactly when the connection has successfully closed.


```js

connection.close()
  .then(result => {
    // The connection is now closed.
  });

```

Once closed the connection is removed from the cache.


## Tests

    npm test


---
### License: MIT
