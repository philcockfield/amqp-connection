"use strict";
import R from "ramda";
import { expect } from "chai";
import amqp from "amqplib";
import connection from "../src/main";
import { reset, exists } from "../src/main";

const URL = "amqp://guest:guest@dev.rabbitmq.com";


describe("Integration tests", function() {
  this.timeout(5 * 1000);
  beforeEach(() => {
    reset();
  });


  it("connects to a live server", () => {
    return connection(URL)
      .then(conn => {
        expect(R.is(Function, conn.createChannel)).to.equal(true);
      });
  });


  it("removes connection from cache when closed", (done) => {
    return connection(URL)
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
