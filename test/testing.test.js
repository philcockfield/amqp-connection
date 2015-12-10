"use strict";
import R from "ramda";
import { expect } from "chai";
import connect from "../src/main";
import FakeConnection from "../src/fakes/FakeConnection";



describe("Fakes (test helpers)", function() {
  it("fake() method converts the connect method to return {FakeConnection}", () => {
    connect.fake();
    return connect("amqp://rabbitmq").then(conn => {
        expect(conn).to.be.an.instanceof(FakeConnection);
    })
  });

  it("real() method reverts to a real connection [integration]", () => {
    connect.fake();
    connect.real();
    return connect("amqp://guest:guest@dev.rabbitmq.com").then(conn => {
        expect(conn).not.to.equal(undefined);
        expect(conn).not.to.be.an.instanceof(FakeConnection);
    });
  });
});
