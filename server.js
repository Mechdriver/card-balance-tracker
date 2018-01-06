const _ = require('lodash');
const http = require('http');
const express = require('express');

const bodyParser = require('body-parser');

const later = require('later');

const assert = require('assert');

const MongoClient = require('mongodb').MongoClient;
const MessagingResponse = require('twilio').twiml.MessagingResponse;

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

const dbPass = process.env.DB_PASS;

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

app.post('/sms', (req, res) => {
  let twiml = new MessagingResponse();

  //twiml.message("This is a generic test response. You're welcome");

  console.log(req.body.Body);

  res.writeHead(200, {'Content-Type': 'text/xml'});
  res.end();
});

http.createServer(app).listen(1337, () => {
  console.log('Express server listening on port 1337');
});

//TODO: Move DB functionality elsewhere maybe
function initTransactionCollection() {
  //Amount, User, Date
  MongoClient.connect(dbUrl, (err, client) => {
    assert.equal(null, err);
    console.log("Connected successfully to server.");

    let db = client.db(dbName);
    let collection = db.collection('transactions');

    collection.find().toArray((err, transactions) => {
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
  MongoClient.connect(dbUrl, (err, client) => {
    assert.equal(null, err);
    console.log("Connected successfully to server");

    let db = client.db(dbName);

    client.close();
  });
}

function refreshFunds() {
  MongoClient.connect(dbUrl, (err, client) => {
    assert.equal(null, err);
    console.log("Connected successfully to server");

    let db = client.db(dbName);

    client.close();
  });
}

function addNewUser() {
  MongoClient.connect(dbUrl, (err, client) => {
    assert.equal(null, err);
    console.log("Connected successfully to server");

    let db = client.db(dbName);

    client.close();
  });
}

function getRemainingBalance() {
  MongoClient.connect(dbUrl, (err, client) => {
    assert.equal(null, err);
    console.log("Connected successfully to server");

    let db = client.db(dbName);

    client.close();
  });
}
