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
const port = 3000;

//Set up required packages
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

//Setup the API routes
//GET method route

//POST method route
app.get('/', function (req, res) {
  res.send('TS20 API is up and running.')
});
app.post('/', function (req, res) {
    //get POST params to variables
    var canid = req.body.canid;
    var data = req.body.data;
    var datetime = req.body.datetime;

	//Check Parameters are valid
    if (canid != null && data != null && datetime != null){
        res.send(`Got POST data:\n ${datetime}  ${canid}: ${data}`);
    }
    else{
        res.status(400);
        res.send('Bad Request: No data or incorrect data sent');
    }
  });


//Start the server
app.listen(port);
console.log('TS20API listening at http://10.0.0.171:${port}');
