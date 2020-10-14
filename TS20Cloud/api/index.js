/*
  Name: TS20API
  Description: This is an API to sync POST requests to the DB and provide a valid HTTP response code as an ACK to the car.
  Author: Baylin Ferguson
  Version: 1.0.0
  Last Updated: 28/04/2020
*/

//Set up app
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();

//SET UP API PORT AND VARIABLES
const port = 3000;
const dbVars = {
  host: 'db',
  user: 'ts20',
  password: 'ts20',
  database: 'ts20'
};

//Set up required packages
//Setup the API to use the CORS header
app.use(cors())

//body parser - required to pull POST params into variables.
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

//crypto - required to calculate the hash of the data as a checksum
const crypto = require('crypto');

//mysql - required to push data to the SQL server.
var mysql = require('mysql');
const { raw } = require('body-parser');

//Setup the API routes
//GET method route
app.get('/', function (req, res) {
  res.send('TS20 API is up and running.')
});

/***********************************************************************************************
 *  DBSync POST Request Route
 ***********************************************************************************************/
app.post('/sync', async function (req, res) {
  //get POST params to variables
  var rawdata = String(req.body.data);
  var hash = req.body.hash;
  var locHash = crypto.createHash('md5').update(rawdata).digest("hex");
  rawdata = rawdata.replace(/'/g,'"');
  var dataArr = JSON.parse(rawdata);
  //Check Parameters are valid
  if (hash == locHash) {
    try{
      //setup MySQL Connection
      var connection = mysql.createConnection(dbVars);
      //Open MySQL Connection to push data to DB
      connection.connect();
      //Extract data from the raw data paresed
      var extractedData = await extractData(connection, dataArr);
      //If we are unable to extract data throw error
      if (extractData.length == 0){
        throw "Error Extracting data!";
      }
      //Push data to the database and throw an error if unsuccessful
      if (await pushExtractedDB(connection, extractedData) !== "OK"){
        throw "Error pushing extracted data to DB!";
      }
      //Data was pushed to the database so send 200 OK to allow removal from RPI DB
      res.status(200).send("Added to DB successfully");
    }
    catch(ex){
      console.log('Error Occured!');
      console.log(ex);
      res.status(500).send('Error Occured: ' + ex);
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
 *  DBSync Support Functions
 ***********************************************************************************************/
//Pushes extracted data into the database
async function pushExtractedDB(connection, data){  
  return new Promise(function(resolve, reject){
    var query = `INSERT INTO SensorData(CanId, Data, UTCTimestamp) VALUES ?`;  
    connection.query(query, [data.map(item => [item.CanId, item.Data, item.UTCTimestamp])], function (err) {
      //if an error occurs catch it and log to the console.
      if (err) {
        reject(err.toString());
      }
      else{
        resolve("OK");
      }
    }); 
  });
}

//Retrieves the template for the CAN ID in the DB, if it cant find the template it gets the DEFAULT
async function getTemplate(connection, canId){  
  return new Promise(function(resolve, reject){
    var query = `SELECT Template FROM CanTemplates WHERE CanId = ?`;  
    connection.query(query, [canId], function (err, result) {
      //if an error occurs catch it and log to the console.
      if (err) {      
        reject(err);
      }
      else{
        //if we got a template then return it
        if (result.length == 1){                    
          resolve(result[0].Template);
        } 
        //If we couldnt get the template then get the defualt template to apply
        else{
          getTemplate(connection, 'DEFAULT').then(template => resolve(template));          
        }
      }
    });
  });
}

//Applies the JSON template to the raw data to split it into 0xAB-C and respective pieces of data
//As per what P+E have said is the new standard.
function applyTemplate(raw, template){
  //raw.CanId, raw.Data, raw.UTCTimestamp  
  var templates = null;  
  var parsed = JSON.parse(template);  
  templates = parsed.template;  
  var extractedData = [];
  var dataBuffer = Buffer.from(raw.Data, 'hex');
  //extract the data according to each sub template
  templates.forEach(subTemplate => {
    var data = null;    
    switch (subTemplate.dataType) {
      case "int":
        data = dataBuffer.readIntLE(subTemplate.offset, subTemplate.length);
        break;
      case "intBE":
        data = dataBuffer.readIntBE(subTemplate.offset, subTemplate.length);
        break;
      case "float":
        data = dataBuffer.readFloatLE(subTemplate.offset);
        break;
      case "floatBE":
        data = dataBuffer.readFloatBE(subTemplate.offset);
        break;  
      default:
        break;
    }       
    if (data != null){
      //apply the rest of the objects of the data to the new data piece
      var canId = raw.CanId;
      //Apply 0xAB-C notation if there is more than 1 bit of data for a can id
      if (templates.length > 1){
        canId += '-' + subTemplate.index; 
      }         
      extractedData.push({
        CanId: canId,
        Data:  data,
        UTCTimestamp:  raw.UTCTimestamp
      });
    } 
  });
  return extractedData;
}

//Function to extact the data, gets the template then applies it
async function extractData(connection, dataArr){  
  var extractedData = [];
  for (let data of dataArr){    
    var template = await getTemplate(connection, data.CanId);
    var extracted = applyTemplate(data, template);
    extracted.forEach(extData => extractedData.push(extData));     
  }  
  return extractedData;
}


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

  //BUILD THE QUERY STRING
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
    var connection = mysql.createConnection(dbVars);
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
      else{
        res.type('json');
        res.status(200);
        res.json(result);
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

  //BUILD QUERY STRING
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
      var connection = mysql.createConnection(dbVars);
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
