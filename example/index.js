var connect = require("../");

connect("amqp://rabbitmq")
  .then(connection => {
    console.log("connection", connection);
    console.log("");
  })
  .catch(err => {
    console.log("err", err);
    console.log("");
  });
