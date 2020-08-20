/*
  Name: TS20API
  Description: This is an API to sync POST requests to the DB and provide a valid HTTP response code as an ACK to the car.
  Author: Baylin Ferguson
  Version: 1.0.0
  Last Updated: 28/04/2020
*/

//Set up app
const express = require('express');
const app = express();
const cors = require('cors');
const port = 3000;

//Setup the API to use the CORS header
app.use(cors())

//Set up required packages
//body parser - required to pull POST params into variables.
const bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

//crypto - required to calculate the hash of the data as a checksum
const crypto = require('crypto');

//mysql - required to push data to the SQL server.
var mysql = require('mysql');

//Setup the API routes
//GET method route
app.get('/', function (req, res) {
  res.send('TS20 API is up and running.')
});

/***********************************************************************************************
 *  DBSync POST Request Route
 ***********************************************************************************************/
app.post('/sync/single', function (req, res) {
  var errors = false;
  //get POST params to variables
  var canid = req.body.canid;
  var data = req.body.data;
  var datetime = req.body.datetime;
  var hash = req.body.hash;
  var locHash = crypto.createHash('md5').update(datetime + canid + data).digest("hex");
  //Check Parameters are valid
  if (canid != null && data != null && datetime != null && hash == locHash) {
    try {
      //setup MySQL Connection
      var connection = mysql.createConnection({
        host: 'localhost',
        user: 'ts20',
        password: 'ts20',
        database: 'ts20'
      });
      //Open MySQL Connection to push data to DB
      connection.connect();
      //Set up the query string to add data to the database
      var query = `INSERT INTO SensorData(CanId, Data, UTCTimestamp) VALUES('${canid}','${data}','${datetime}')`;
      //Add Record to DB in SensorData Table
      connection.query(query, function (err) {
        //if an error occurs catch it and log to the console.
        if (err) {
          console.log(err);
          errors = true;
        }
      });
      //Close MySQL Connection
      connection.end();
      //catch any errors from adding the data to the database and opening the connection to the db
    } catch (ex) {
      console.log(ex);
      errors = true;
    }
    //if there were no errors respond with a 200 OK status
    if (!errors) {
      res.status(200).send("Added to DB successfully");
    } else {
      //otherwise there were errors so return a 500 internal server error with the error message.
      res.status(500).send('Error Occurred adding data to DB: \n' + ex);
    }
  }
  //incorrect parameters passed in POST request
  else {
    //Set the response status to 400 Bad Request
    res.status(400);
    //if the post request was bad due to incorrect parameters passed tell the user.
    if (canid == null || data == null || datetime == null || hash == null) {
      res.send('Bad Request: No data or incorrect data sent');
    }
    //if the hash did not match then tell the user that there is bad data in the request.
    else if (locHash != hash) {
      res.send('Bad Request: Hash did not match, data may be corrupted!');
    }
  }
});

/***********************************************************************************************
 *  DBSync POST Request Route
 ***********************************************************************************************/
app.post('/sync', function (req, res) {
  var errors = false;
  //get POST params to variables
  var rawdata = String(req.body.data);
  var hash = req.body.hash;
  var locHash = crypto.createHash('md5').update(rawdata).digest("hex");
  rawdata = rawdata.replace(/'/g,'"');
  var dataArr = JSON.parse(rawdata);
  console.log(hash);
  console.log(locHash);
  //Check Parameters are valid
  if (hash == locHash) {
    try {
      //setup MySQL Connection
      var connection = mysql.createConnection({
        host: 'localhost',
        user: 'ts20',
        password: 'ts20',
        database: 'ts20'
      });
      //Open MySQL Connection to push data to DB
      connection.connect();
      //Set up the query string to add data to the database
      var query = `INSERT INTO SensorData(CanId, Data, UTCTimestamp) VALUES ?`;
      //Add Record to DB in SensorData Table
      connection.query(query, [dataArr.map(item => [item.CanId, item.Data, item.UTCTimestamp])], function (err) {
        //if an error occurs catch it and log to the console.
        if (err) {
          console.log(err);
          errors = true;
        }
      });
      //Close MySQL Connection
      connection.end();
      //catch any errors from adding the data to the database and opening the connection to the db
    } catch (ex) {
      console.log(ex);
      errors = true;
    }
    //if there were no errors respond with a 200 OK status
    if (!errors) {
      res.status(200).send("Added to DB successfully");
    } else {
      //otherwise there were errors so return a 500 internal server error with the error message.
      res.status(500).send('Error Occurred adding data to DB: \n' + ex);
    }
  }
  //incorrect parameters passed in POST request
  else {
    //Set the response status to 400 Bad Request
    res.status(400);
    //if the post request was bad due to incorrect parameters passed tell the user.
    if (canid == null || data == null || datetime == null || hash == null) {
      res.send('Bad Request: No data or incorrect data sent');
    }
    //if the hash did not match then tell the user that there is bad data in the request.
    else if (locHash != hash) {
      res.send('Bad Request: Hash did not match, data may be corrupted!');
    }
  }
});

/***********************************************************************************************
 *  Datavis GET Request Route
 ***********************************************************************************************/
app.get('/data', function (req, res) {
  var errors = false;

  //check parameters and autofill if needed or throw 400
  var maxResults = req.query.max;
  if (maxResults == null || !Number.isInteger(Number(maxResults))) {
    maxResults = 10;
  }

  var WhereStmts = [];

  var IDWhere = "";
  var rawSensorID = req.query.canId;
  if (rawSensorID != null) {
    var sensorIDs = JSON.parse(rawSensorID);
    if (sensorIDs != null) {
      IDWhere = "SensorData.CanId IN (";
      for (var i = 0; i < sensorIDs.length; i++) {
        IDWhere += "'" + sensorIDs[i] + "'";
        if (i != sensorIDs.length - 1) {
          IDWhere += ","
        }
      }
      IDWhere += ")";
      WhereStmts.push(IDWhere);
    }
  }

  var startTime = req.query.startTime;
  if (startTime != null) {
    WhereStmts.push(`SensorData.UTCTimestamp >= ${startTime}`);
  }

  var endTime = req.query.endTime;
  if (endTime != null) {
    WhereStmts.push(`SensorData.UTCTimestamp <= ${endTime}`);
  }

  var WhereStatement = "";
  if (WhereStmts.length > 0) {
    WhereStatement = "WHERE "
    WhereStmts.forEach(function (stmt, index, arr) {
      WhereStatement += stmt
      if (index != arr.length - 1) {
        WhereStatement += " AND "
      }
    });
  }

  try {
    //setup MySQL Connection
    var connection = mysql.createConnection({
      host: 'localhost',
      user: 'ts20',
      password: 'ts20',
      database: 'ts20'
    });
    //Open MySQL Connection to push data to DB
    connection.connect();
    //Set up the query string to get data from the database
    //var queryStr = `SELECT CanId, Data, UTCTimestamp FROM SensorData LIMIT ${maxResults}`;
    var queryStr = `SELECT SensorData.UTCTimestamp, SensorData.CanId, SensorData.Data 
    FROM SensorData 
    ${WhereStatement}
    ORDER BY SensorData.UTCTimestamp DESC
    LIMIT ${maxResults}`;
    //Add Record to DB in SensorData Table
    connection.query(queryStr, function (err, result, fields) {
      //if an error occurs catch it and log to the console.
      if (err) {
        console.log(err);
        errors = true;
      }
      res.type('json');
      res.status(200);
      res.json(result);
    });
    //Close MySQL Connection
    connection.end();
    //catch any errors from adding the data to the database and opening the connection to the db
  } catch (ex) {
    console.log(ex);
    errors = true;
  }
  //if there were no errors respond with a 200 OK status
  if (errors) {
    res.status(500).send("Error Occurred Querying DB\n");
  }
});

/***********************************************************************************************
 *  Datavis Sensor Description Get Request Route
 ***********************************************************************************************/
app.get('/desc', function (req, res) {
  var errors = false;
  var invalidParams = false;

  var IDWhere = "";
  var rawSensorID = req.query.canId;
  if (rawSensorID != null) {
    var sensorIDs = JSON.parse(rawSensorID);
    if (sensorIDs != null) {
      IDWhere = "WHERE Sensors.CanId IN (";
      for (var i = 0; i < sensorIDs.length; i++) {
        IDWhere += "'" + sensorIDs[i] + "'";
        if (i != sensorIDs.length - 1) {
          IDWhere += ","
        }
      }
      IDWhere += ")";
    }
    else {
      invalidParams = true;
    }
  }
  else {
    invalidParams = true;
  }

  if (invalidParams == false) {
    try {
      //setup MySQL Connection
      var connection = mysql.createConnection({
        host: 'localhost',
        user: 'ts20',
        password: 'ts20',
        database: 'ts20'
      });
      //Open MySQL Connection to pull data from DB
      connection.connect();
      //Set up the query string to get data from the database
      var queryStr = `SELECT Sensors.CanId, Sensors.Name, SensorType.Description, SensorUnit.UnitName, SensorUnit.UnitMetric
      FROM Sensors
      INNER JOIN SensorType ON SensorType.SensorTypeId=Sensors.SensorTypeId
      INNER JOIN SensorUnit ON SensorUnit.UnitId=SensorType.UnitId 
      ${IDWhere}`;
      //Add Record to DB in SensorData Table
      connection.query(queryStr, function (err, result, fields) {
        //if an error occurs catch it and log to the console.
        if (err) {
          console.log(err);
          errors = true;
        }
        res.type('json');
        res.status(200);
        res.json(result);
      });
      //Close MySQL Connection
      connection.end();
      //catch any errors from adding the data to the database and opening the connection to the db
    } catch (ex) {
      console.log(ex);
      errors = true;
    }
  }
  if (invalidParams == true) {
    res.status(400).send("Invalid Parameters Passed");
  }
  //if there were no errors respond with a 200 OK status
  if (errors) {
    res.status(500).send("Error Occurred Querying DB\n");
  }
});

//Start the server
app.listen(port);
console.log(`TS20API listening on port ${port}`);
