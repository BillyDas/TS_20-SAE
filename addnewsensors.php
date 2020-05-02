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


 					 <p>Does your sensor spit out multiple types of data in an array? if so please fill out this form 1x for each of the senors arrays</p>
           <p>e.g a G-Force acceleration sensor has 3 axis of data (X,Y,Z) data, so it would be filled out as follows</p>
           <br />
     <table style="width:100%">
     <tr>
       <th>CanID</th>
       <th>Name</th>
       <th>SensorTypeId</th>
     </tr>
     <tr>
       <td>0x610-0 (FIRST Data Array Slot)</td>
       <td>G-Force Acceleration X (X being the X axi's Data)</td>
       <td>1 (1 being the type ID)</td>
     </tr>
     <tr>
       <td>0x610-1 (SECOND Data Array Slot)</td>
       <td>G-Force Acceleration Y (Y being the Y axi's Data)</td>
       <td>1 (1 being the type ID)</td>
     </tr>
     <tr>
       <td>0x610-2 (THIRD Data Array Slot)</td>
       <td>G-Force Acceleration Z (Z being the Z axi's Data)</td>
       <td>1 (1 being the type ID)</td>
     </tr>
   </table>
   <br />

   <p> Please reffer to the data printed below for the SensorTypeId's If they already exist </p>

   <?php
      require_once('databasedetails.php');

      //this function is to print out the TOP half of the table
      function printdatapresensors(){
        echo "<table border=\"2\">\n";
        echo "<tr>\n "
        ."<th scope=\"col\">CanId</th>\n "
        ."<th scope=\"col\">Name</th>\n "
        ."<th scope=\"col\">SensorTypeId</th>\n "
        ."</tr>\n ";
      }
      //This function is to print out the conclusion fo the table
      function printdatapost(){
          echo "</table>\n ";
      }

      //Sanitise Input function
      function sanitise_input($data) {
        $data = trim($data);
        $data = stripslashes($data);
        $data = htmlspecialchars($data);
        return $data;
      }

      //Print Data Function
      function printdatasensors($result){
        if ($result != null)
        {
          while ($row = mysqli_fetch_assoc($result))
          {
             echo "<td>",$row['CanId'],"</td>\n";
             echo "<td>",$row['Name'],"</td>\n";
             echo "<td>",$row['SensorTypeId'],"</td>\n";
             echo "</tr>\n ";s
          }
        }
      }

      if (mysqli_connect_errno())
      {
         echo "Failed to connect to MySQL: " . mysqli_connect_error();
         //you need to exit the script, if there is an error
         exit();

      } else {
       $query = "SELECT * FROM Sensors";
       $results = mysqli_query($conn, $query) or trigger_error("Query Failed! SQL: $query - Error: ".mysqli_error($conn), E_USER_ERROR);
       printdatapresensors();
       printdatasensors($results);
       printdatapost();
      }

      ini_set('display_errors', 1);
      ini_set('display_startup_errors', 1);
      error_reporting(E_ALL);


      ?>


      <form action="addnewsensorsresult.php" method="POST">
        <fieldset>
           <legend>Add New Sensors Form:</legend>
 					 <label name="sensorName">What Is The Sensors Name?</label><input id="sensorName" name="sensorName"/><br />
 					 <label name="sensorCanID">What Is The Sensors CANID?</label><input id="sensorCanID" name="sensorCanID"/><br />

 					 <label name="startdate">Start Date:</label><input type="date" id="startdate" name="startdate"/><br />
 					 <label name="enddate">End Date:</label><input type="date" id="enddate" name="enddate"/><br />
 					 <button type="submit">Post</button>
          </fieldset>
      </form>
</body>
</html>
