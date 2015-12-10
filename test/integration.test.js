"use strict";
import R from "ramda";
import { expect } from "chai";
import amqp from "amqplib";
import connection from "../src/main";
import { reset } from "../src/main";

const URL = "amqp://guest:guest@dev.rabbitmq.com";


describe("Integration tests", function() {
  beforeEach(() => {
    reset();
  });


  it("connects to a live server", () => {
      return connection(URL)
        .then(conn => {
          expect(R.is(Function, conn.createChannel)).to.equal(true);
        });
  });
});
