const _ = require('lodash');
const express = require('express');
const later = require('later');
const assert = require('assert');
const MongoClient = require('mongodb').MongoClient;

const app = express();

//TODO: Change to an environemnt var
const dbPass = 'python04';

// Connection URL
const dbUrl = 'mongodb://zbehnke:' + dbPass + '@ds123896.mlab.com:23896/card-tracker';
// Database Name
const dbName = 'card-tracker';

const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_TOKEN;

const heidiNum = process.env.HEIDI_NUM;
const zachNum = process.env.ZACH_NUM;
const numList = [heidiNum, zachNum];

later.date.localTime();
let recurSched = later.parse.recur().first().dayOfMonth();

let now = new Date();

initTransactionCollection();

function initTransactionCollection() {
  //Amount, User, Date

  MongoClient.connect(dbUrl, function(err, client) {
    assert.equal(null, err);
    console.log("Connected successfully to server.");

    let db = client.db(dbName);
    let collection = db.collection('transactions');

    collection.find().toArray(function(err, transactions) {
      if (!transactions.length) {
        console.log("Creating initial transaction.")
        //Initial default insertion of $150
        collection.insertOne({amount: 150, user: 'system', date: now},
          function(err, result) {
            assert.equal(null, err);
          });

        client.close();
      } else {
        console.log('Transactions collection exists.');
        client.close();
      }
    });
  });
}

function insertTransaction() {
  MongoClient.connect(dbUrl, function(err, client) {
    assert.equal(null, err);
    console.log("Connected successfully to server");

    let db = client.db(dbName);

    client.close();
  });
}

function refreshFunds() {
  MongoClient.connect(dbUrl, function(err, client) {
    assert.equal(null, err);
    console.log("Connected successfully to server");

    let db = client.db(dbName);

    client.close();
  });
}

function addNewUser() {
  MongoClient.connect(dbUrl, function(err, client) {
    assert.equal(null, err);
    console.log("Connected successfully to server");

    let db = client.db(dbName);

    client.close();
  });
}

function getRemainingBalance() {
  MongoClient.connect(dbUrl, function(err, client) {
    assert.equal(null, err);
    console.log("Connected successfully to server");

    let db = client.db(dbName);

    client.close();
  });
}
