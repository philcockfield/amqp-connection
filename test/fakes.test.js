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

  it("real() method reverts to a real connection [integration]", () => {
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

      const args = channel.test.assertExchange[0];
      expect(args.exchange).to.equal("exchange-name");
      expect(args.type).to.equal("fanout");
      expect(args.options).to.equal(options);

      return asserting.then(result => {
          expect(result).to.equal(true);
      });
    });


    it(".assertQueue()", () => {
      const options = { durable: false };
      const asserting = channel.assertQueue("queue-name", options);
      expect(asserting.then).to.be.an.instanceof(Function);

      const args = channel.test.assertQueue[0];
      expect(args.queue).to.equal("queue-name");
      expect(args.options).to.equal(options);

      return asserting.then(result => {
          expect(result.queue).to.equal("queue-name");
      });
    });


    it(".publish()", () => {
      const data = new Buffer(123);
      const options = {};

      const result = channel.publish("exchange-name", "routing-key", data, options);
      expect(result).to.equal(true);

      const args = channel.test.publish[0];
      expect(args.exchange).to.equal("exchange-name");
      expect(args.routingKey).to.equal("routing-key");
      expect(args.content).to.equal(data);
      expect(args.options).to.equal(options);
    });




  });
});
