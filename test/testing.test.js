"use strict";
import R from "ramda";
import Promise from "bluebird";
import { expect } from "chai";
import connect from "../src/main";
import FakeConnection from "../src/fakes/FakeConnection";
import FakeChannel from "../src/fakes/FakeChannel";


describe("Fakes (test helpers)", function() {
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


    it("assertExchange", () => {
      const result = channel.assertExchange("exchange-name", "fanout", { durable: false });
      expect(result.then).to.be.an.instanceof(Function);
    });
  });

});
