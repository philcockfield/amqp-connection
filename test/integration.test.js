"use strict";
import R from "ramda";
import Promise from "bluebird";
import { expect } from "chai";
import amqp from "amqplib";
import connect from "../src/main";
import { reset, exists } from "../src/main";

const URL = "amqp://guest:guest@dev.rabbitmq.com";


describe("Integration tests", function() {
  this.timeout(5 * 1000);
  beforeEach(() => {
    reset();
    connect.real(); // Ensure {FakeConnection} is not being used.
  });


  it("connects to a live server", () => {
    return connect(URL)
      .then(conn => {
        expect(R.is(Function, conn.createChannel)).to.equal(true);
      });
  });


  it("re-uses an existing connection", (done) => {
    Promise.all([connect(URL), connect(URL)])
      .then(connections => {
          expect(connections[0]).to.equal(connections[1]);
          done();
      });
  });


  it("fails to connect to a server", (done) => {
    connect("amqp://fail")
      .catch(err => {
        expect(err.code).to.equal("ENOTFOUND");
        done();
      });
  });


  it("removes connection from cache when closed", (done) => {
    return connect(URL)
      .then(conn => {
          expect(exists(URL)).to.equal(true);
          conn.close()
            .then(result => {
                expect(result.url).to.equal(URL);
                expect(exists(URL)).to.equal(false);
                done();
            });
      });
  });
});
