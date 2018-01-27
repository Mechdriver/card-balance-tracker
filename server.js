require('dotenv').config();
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
const contactBook = {'Heidi': heidiNum, 'Zach': zachNum};

//TODO: Set up database refresher
later.date.localTime();
let recurSched = later.parse.recur().first().dayOfMonth();

let now = new Date();

initTransactionCollection();

app.post('/sms', (req, res) => {
  let twiml = new MessagingResponse();
  let fromNum = Number(req.body.From);
  let message = req.body.Body;

  let httpResponse = 200;

  //Determine User
  try {
    let userName = getUserName(fromNum);
    console.log(userName);
  } catch(ex) {
    console.log('An exception occured: ' + ex.message);
    httpResponse = 401;
  }

  //Handle incoming commands
  if (httpResponse == 200) {
    let command = determineCommand(message);
    twiml.message(processCommand(command));
  }

  console.log('Sending message.');
  res.writeHead(httpResponse, {'Content-Type': 'text/xml'});
  res.end(twiml.toString());
});

http.createServer(app).listen(1337, () => {
  console.log('Express server listening on port 1337');
});

//Helper Functions
numberToUSDString = (number) => {
  currency = String(number);

  if (currency.length <= 2) {
    currency = '0' + currency;
  }

  currency = "$" + currency.substr(0, (currency.length - 2)) + "." + currency.substr((currency.length - 2));
  return currency;
}

getUserName = (fromNum) => {
  if (fromNum == zachNum) {
    return 'Zach';
  } else if (fromNum == heidiNum) {
    return 'Heidi';
  } else {
    throw {message: "Unauthorized User"};
  }
}

determineCommand = (message) => {
  message = message.toLowerCase();

  if (message.includes('undo')) {
    return 'undo';
  } else if (message.includes('spent')) {
    return 'spent';
  } else if (message.includes('total')) {
    return 'total';
  } else if (message.includes('commands')) {
    return 'commands';
  } else if (/\d/.test(message)) {
    return 'deduction';
  } else {
    return 'fubar';
  }
}

processCommand = (command) => {
  switch (command) {
    //Handle Deduction
    case 'deduction':
      var amount = convertToNum(message);
      insertDeduction(userName, amount);
      var total = getRemainingBalance();
      var currency = numberToUSDString(total);
      alertDeductionToOtherUsers(userName, currency);

      return "Success! You have " + currency + " remaining.";
    break;

    //Handle Undo
    case 'undo':
      return 'Undo.';
    break;

    //Handle spent
    case 'spent':
      return 'Spent.';
    break;

    //Handle total request
    case 'total':
      var total = getRemainingBalance();
      var currency = numberToUSDString(total);
      return "You have " + currency + " remaining.";
    break;

    //Handle Help
    case 'commands':
      var commandMessage = "'XX.XX': Deduct an amount.\
                          'Undo': Undoes the last deduction.\
                          'Total': Sends the amount remaining.\
                          'Spent': Sends how much you have spent this month."
      return commandMessage;
    break;

    //Default Error
    default:
      return "Sorry. I don't understand. Send 'commands' for a list of commands.";
  }
}

convertToNum = (data) => {
  data = data.replace('\.', '');
  return Number(data);
}

//Twilio Helpers
alertDeductionToOtherUsers = (userName) => {
//TODO: Write this...
}

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
        collection.insertOne({user: 'system', amount: 15000, date: now},
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

function insertDeduction(userName, amount) {
  MongoClient.connect(dbUrl, (err, client) => {
    assert.equal(null, err);
    console.log("Connected successfully to server");

    let db = client.db(dbName);
    let collection = db.collection('transactions');

    collection.insertOne({user: userName, amount: -amount, date: now},
      function(err, result) {
        assert.equal(null, err);
      });

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

function getRemainingBalance() {
  MongoClient.connect(dbUrl, (err, client) => {
    assert.equal(null, err);
    console.log("Connected successfully to server");

    let db = client.db(dbName);
    let collection = db.collection('transactions');

    /*collection.aggregate(
 { "$project": {
      "year":{"$year":"$created_at"},
      "month":{"$month":"$created_at"},
 },
 { "$match":{
      "year" :2015,
      "month": 3
   }
 })*/

    client.close();
  });
}

function getAmountSpentByUser() {
  MongoClient.connect(dbUrl, (err, client) => {
    assert.equal(null, err);
    console.log("Connected successfully to server");

    let db = client.db(dbName);

    client.close();
  });
}
