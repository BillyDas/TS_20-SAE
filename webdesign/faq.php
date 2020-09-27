<!DOCTYPE html>
<html lang="en">
<head>
   <meta charset="utf-8" />
   <meta name="description" content="TS_20 FAQ />
   <meta name="keywords" content="PHP" />
   <meta name="author" content="Ben Grunow / 100588519" />
   <title>Add New Sensor</title>
  <?php require "inc/head.html" ?>
</head>
<body>
   <?php include "inc/navbarContents.php" ?>
   <div id = "main">
   <h1>FAQ - Frequently Asked Questions</h1>
   <hr>
   <h3>• How do I add a new sensor?</h3>
   <p>Go to the <a href="addnewsensors.php">add new sensor</a> page. Instructions can be found there, but are briefly reproduced below for completeness:</p>
   <ul>
   <li>Give the sensor a name</li>
   <li>Find the CanID of the sensor and select it from the dropdown</li>
   <li>Associate the sensor with a unit of measurement</li>
   <li>Add to database!</li>
   </ul>
   
   <h3>• How do I access a graph?</h3>
   <p>Click on of the three preloaded graphs on the left, or create a custom visualisation. <br/>In a custom visualisation, you can select the date / time range to display, as well as which data to display on each axis.</p>
   
   <h3>• How do I remove a sensor?</h3>
   
   <h3>• How can I delete data?</h3>
   
   <h3>• How do I find the CanID of a new sensor?</h3>
   <p>For newly added sensors, the CanID should be automatically added, and the ID available in the <a href="addnewsensors.php">add new sensor</a> page.<br/>If it is not present, you may need to manually add it.</p>
</div>
</body>
</html>
