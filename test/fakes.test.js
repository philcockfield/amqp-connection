"use strict";
import R from "ramda";
import Promise from "bluebird";
import { expect } from "chai";
import connect from "../src/main";
import FakeConnection from "../src/fakes/FakeConnection";
import FakeChannel from "../src/fakes/FakeChannel";


describe("Fakes (test helpers)", function() {
  this.timeout(5 * 1000);
  afterEach(() => {
    connect.real();
  });

  it("fake() method converts the connect method to return {FakeConnection}", () => {
    connect.fake();
    return connect("amqp://rabbitmq").then(conn => {
        expect(conn).to.be.an.instanceof(FakeConnection);
    })
  });

  it("fake() method returns an instance of the {FakeConnection}", () => {
    expect(connect.fake()).to.be.an.instanceof(FakeConnection);
  });

  it.skip("real() method reverts to a real connection [integration]", () => {
    connect.fake();
    connect.real();
    return connect("amqp://guest:guest@dev.rabbitmq.com").then(conn => {
        expect(conn).not.to.equal(undefined);
        expect(conn).not.to.be.an.instanceof(FakeConnection);
    });
  });


  describe("Connection", function() {
    it("connection.createChannel() returns a {FakeChannel}", () => {
      Promise.coroutine(function*() {
        connect.fake();
        const conn = yield connect("amqp://rabbitmq");
        const channel = yield conn.createChannel();
        expect(channel).to.be.an.instanceof(FakeChannel);
        expect(conn.test.channels).to.contain(channel);
      }).call(this);
    });
  });


  describe("FakeChannel", function() {
    let channel;
    beforeEach(done => {
      Promise.coroutine(function*() {
          connect.fake();
          const conn = yield connect("amqp://rabbitmq");
          channel = yield conn.createChannel();
          done();
      }).call(this);
    });


    it(".assertExchange()", () => {
      const options = { durable: false };
      const asserting = channel.assertExchange("exchange-name", "fanout", options);
      expect(asserting.then).to.be.an.instanceof(Function);

      const params = channel.test.assertExchange[0];
      expect(params.exchange).to.equal("exchange-name");
      expect(params.type).to.equal("fanout");
      expect(params.options).to.equal(options);

      return asserting.then(result => {
          expect(result).to.equal(true);
      });
    });


    it(".assertQueue()", () => {
      const options = { durable: false };
      const asserting = channel.assertQueue("queue-name", options);
      expect(asserting.then).to.be.an.instanceof(Function);

      const params = channel.test.assertQueue[0];
      expect(params.queue).to.equal("queue-name");
      expect(params.options).to.equal(options);

      return asserting.then(result => {
          expect(result.queue).to.equal("queue-name");
      });
    });


    it(".bindQueue()", () => {
      const args = {};
      const binding = channel.bindQueue("queue-name", "source", "pattern", args);
      expect(binding.then).to.be.an.instanceof(Function);

      const params = channel.test.bindQueue[0];
      expect(params.queue).to.equal("queue-name");
      expect(params.source).to.equal("source");
      expect(params.pattern).to.equal("pattern");
      expect(params.args).to.equal(args);

      return binding.then(result => {
          expect(result).to.eql({});
      });
    });


    it(".consume()", () => {
      const options = {};
      const fn = (msg) => true;
      const consuming = channel.consume("queue-name", fn, options);
      expect(consuming.then).to.be.an.instanceof(Function);

      const params = channel.test.consume[0];
      expect(params.queue).to.equal("queue-name");
      expect(params.func).to.equal(fn);
      expect(params.options).to.equal(options);

      return consuming.then(result => {
          expect(result).to.eql({ consumerTag: "tag" });
      });
    });


    it(".publish()", () => {
      const data = new Buffer(123);
      const options = {};

      const result = channel.publish("exchange-name", "routing-key", data, options);
      expect(result).to.equal(true);

      const params = channel.test.publish[0];
      expect(params.exchange).to.equal("exchange-name");
      expect(params.routingKey).to.equal("routing-key");
      expect(params.content).to.equal(data);
      expect(params.options).to.equal(options);
    });




  });
});
