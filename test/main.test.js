"use strict";
import { expect } from "chai";
import sinon from "sinon";
import amqp from "amqplib";
import connection from "../src/main";



describe("mq-connection", () => {

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
      const fakeConnection = { isFake: true };
      const mock = sinon.mock(amqp);

      mock
        .expects("connect")
        .once()
        .withArgs(URL, SOCKET_ARGS)
        .returns(new Promise((resolve, reject) => resolve(fakeConnection)));

      return connection(URL, SOCKET_ARGS)
        .then(result => {
            expect(result).to.equal(fakeConnection);
            mock.verify();
        });
    });


    it("rejects if the AMPQ lib fails while connecting", (done) => {
      const mock = sinon.mock(amqp);
      mock
        .expects("connect")
        .returns(new Promise((resolve, reject) => reject(new Error("My Error"))));

      return connection("amqp://rabbitmq")
        .catch(err => {
          expect(err.message).to.equal("My Error");
          mock.verify()
          done();
        });
    });
  });
});
