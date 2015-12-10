"use strict";
import R from "ramda";
import { expect } from "chai";
import sinon from "sinon";
import Promise from "bluebird";
import amqp from "amqplib";
import connect from "../src/main";
import { reset, exists } from "../src/main";
import FakeConnection from "../src/fake-connection";





describe("mq-connection", () => {
  beforeEach(() => {
    reset();
  });

  describe("initialization errors", function() {
    it("throws if a URL was not specified", () => {
      expect(() => connect()).to.throw();
      expect(() => connect(null)).to.throw();
      expect(() => connect("")).to.throw();
    });

    it("throws if the URL does not start with 'amqp://' or 'amqps://'", () => {
      expect(() => connect("rabbitmq")).to.throw();
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
        .returns(new Promise((resolve, reject) => resolve(new FakeConnection())));

      return connect(URL, SOCKET_ARGS)
        .then(result => {
            expect(result).to.be.an.instanceof(FakeConnection);
            mock.verify();
        });
    });


    it("rejects if the AMPQ lib fails while connecting", (done) => {
      const mock = sinon.mock(amqp);
      mock
        .expects("connect")
        .once()
        .returns(new Promise((resolve, reject) => reject(new Error("My Error"))));

      return connect("amqp://rabbitmq")
        .catch(err => {
          expect(err.message).to.equal("My Error");
          mock.verify()
          done();
        });
    });


    it("exists within the cache", (done) => {
      const URL = "amqp://rabbitmq";
      expect(exists(URL)).to.equal(false);

      const mock = sinon.mock(amqp);
      mock
        .expects("connect")
        .returns(new Promise((resolve, reject) => resolve(new FakeConnection())));

      return connect(URL)
        .then(conn => {
            expect(exists(URL)).to.equal(true);
            mock.verify();
            done();
        });
    });


    it("re-uses an existing connection", (done) => {
      const URL = "amqp://rabbitmq";
      const mock = sinon.mock(amqp);
      mock
        .expects("connect")
        .once()
        .returns(new Promise((resolve, reject) => resolve(new FakeConnection())));

      Promise.coroutine(function*() {
          const conn1 = yield connect(URL);
          const conn2 = yield connect(URL);
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
            .returns(new Promise((resolve, reject) => resolve(new FakeConnection())));

          const conn1 = yield connect("amqp://rabbitmq");
          mock.verify();

          mock = sinon.mock(amqp);
          mock
            .expects("connect")
            .once()
            .returns(new Promise((resolve, reject) => resolve(new FakeConnection())));

          const conn2 = yield connect("amqps://rabbitmq");
          mock.verify();

          expect(conn1).not.to.equal(conn2);
          done();
      }).call(this);
    });
  });


  describe("close", function() {
    it("removes connection from cache", (done) => {
      Promise.coroutine(function*() {

        const URL = "amqp://rabbitmq";
        const mock = sinon.mock(amqp);
        mock
          .expects("connect")
          .returns(new Promise((resolve, reject) => resolve(new FakeConnection())));

        expect(exists(URL)).to.equal(false);
        const conn = yield connect(URL);
        expect(exists(URL)).to.equal(true);

        conn.close();
        expect(exists(URL)).to.equal(false);

        mock.verify();
        done();

      }).call(this);
    });
  });
});
