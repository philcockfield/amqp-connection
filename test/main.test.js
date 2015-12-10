"use strict";
import R from "ramda";
import { expect } from "chai";
import sinon from "sinon";
import Promise from "bluebird";
import amqp from "amqplib";
import connection from "../src/main";
import { reset } from "../src/main";

const FAKE_CONNECTION = { isFake: true };


describe("mq-connection", () => {
  beforeEach(() => {
    reset();
  });

  describe("initialization errors", function() {
    it("throws if a URL was not specified", () => {
      expect(() => connection()).to.throw();
      expect(() => connection(null)).to.throw();
      expect(() => connection("")).to.throw();
    });

    it("throws if the URL does not start with 'amqp://' or 'amqps://'", () => {
      expect(() => connection("rabbitmq")).to.throw();
    });
  });


  describe("connecting", function() {
    it("connects to the AMQP server", () => {
      const URL = "amqp://rabbitmq";
      const SOCKET_ARGS = {};
      const mock = sinon.mock(amqp);
      mock
        .expects("connect")
        .once()
        .withArgs(URL, SOCKET_ARGS)
        .returns(new Promise((resolve, reject) => resolve(FAKE_CONNECTION)));

      return connection(URL, SOCKET_ARGS)
        .then(result => {
            expect(result).to.equal(FAKE_CONNECTION);
            mock.verify();
        });
    });


    it("rejects if the AMPQ lib fails while connecting", (done) => {
      const mock = sinon.mock(amqp);
      mock
        .expects("connect")
        .once()
        .returns(new Promise((resolve, reject) => reject(new Error("My Error"))));

      return connection("amqp://rabbitmq")
        .catch(err => {
          expect(err.message).to.equal("My Error");
          mock.verify()
          done();
        });
    });


    it("re-uses an existing connection", (done) => {
      const URL = "amqp://rabbitmq";
      const mock = sinon.mock(amqp);
      mock
        .expects("connect")
        .once()
        .returns(new Promise((resolve, reject) => resolve(FAKE_CONNECTION)));

      Promise.coroutine(function*() {
          const conn1 = yield connection(URL);
          const conn2 = yield connection(URL);
          expect(conn1).to.equal(conn2);
          mock.verify();
          done();
      }).call(this);
    });


    it("returns different connections for distinct URLs", (done) => {
      Promise.coroutine(function*() {
          let mock;
          mock = sinon.mock(amqp);
          mock
            .expects("connect")
            .once()
            .returns(new Promise((resolve, reject) => resolve(R.clone(FAKE_CONNECTION))));

          const conn1 = yield connection("amqp://rabbitmq");
          mock.verify();

          mock = sinon.mock(amqp);
          mock
            .expects("connect")
            .once()
            .returns(new Promise((resolve, reject) => resolve(R.clone(FAKE_CONNECTION))));

          const conn2 = yield connection("amqps://rabbitmq");
          mock.verify();

          expect(conn1).not.to.equal(conn2);
          done();
      }).call(this);
    });
  });
});
