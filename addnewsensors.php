<!DOCTYPE html>
<html lang="en">
<head>
   <meta charset="utf-8" />
   <meta name="description" content="TS_20 Add New Sensors" />
   <meta name="keywords" content="PHP" />
   <meta name="author" content="Billy Dasopatis / 101156315" />
   <title>Add New Sensor</title>
</head>
<body>
   <h1>Adding New Sensors To The Database</h1>
   <hr>

   <form action="addnewsensorsresult.php" method="POST">
         <fieldset>
           <legend>Add New Sensors Form:</legend>
 					 <h3> Please note searching by different fields doesent work, only start date and end date can be searched together</h3>
 					 <h3>Note, if only one date is set, it will default to current date</h3>
 					 <label name="title">Title:</label><input id="title" name="title"/><br />
 					 <label name="title">Keyword *please put a , between each key word*:</label><input id="keywords" name="keywords"/><br />
 					 <label name="startdate">Start Date:</label><input type="date" id="startdate" name="startdate"/><br />
 					 <label name="enddate">End Date:</label><input type="date" id="enddate" name="enddate"/><br />
 					 <button type="submit">Post</button>
          </fieldset>
      </form>
</body>
</html>
