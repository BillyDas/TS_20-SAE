<!DOCTYPE html>
<html lang="en">
<head>
   <meta charset="utf-8" />
   <meta name="description" content="TS_20 Add New Sensors Process Page" />
   <meta name="keywords" content="PHP" />
   <meta name="author" content="Billy Dasopatis / 101156315" />
   <title>Add New Sensor</title>
</head>
<body>
   <h1>Sensor Results</h1>
   <hr>
   <?php
      require_once('databasedetails.php');

      #setup Adding of new stuff to database (0 = Wont add 1 = will add)
      $addSensorName = 0;
      $addSensorCanID = 0;
      $addsensordescription = 0;
      $addSensorTypeID = 0;
      $addUnitID = 0;
      $addUnitName = 0;
      $addUnitMetric = 0;


      echo '<pre>'; print_r($_POST); echo '</pre>';

      #plznobreakshit/hack function
      function sanitise_input($data)
      {
         $data = trim($data);
         $data = stripslashes($data);
         $data = htmlspecialchars($data);
         return $data;
      }
      #check if sensor name is set.
      if (isset($_POST['sensorName']) && !($_POST['sensorName'] == null) )
      {
        #sanitises sensor name
        $sensorName = sanitise_input($_POST['sensorName']);
        $sensorNameLowercase = strtolower($sensorName);
        //Check if sensor name already exists
        $query = "SELECT Name FROM Sensors where Name = '$sensorNameLowercase'";
        $results = mysqli_query($conn, $query) or trigger_error("Query Failed! SQL: $query - Error: ".mysqli_error($conn), E_USER_ERROR);
        if ($results != null) {
          $sensorNameCount = mysqli_num_rows($results);
          if (!($sensorNameCount >= 1)){
            $addSensorName = 1;
            echo "[INFO] - Sensor Name Not In DB, Adding: <strong>". $sensorName . "</strong><br />";
          } else {
            echo "<strong>[ERROR]</strong> - Sensor Name Already In DB: <strong>" . $sensorName . "</strong><br />";
          }
        }
      } else {
          echo "<strong>[ERROR]</strong> - Sensor Name Is Empty <br />";
      }

      #sensor Can Id Shenanigans
      if (isset($_POST['sensorCanID']) && ($_POST['sensorCanID'] !== "none"))
      {
        $sensorCanID = $_POST['sensorCanID'];
        echo "[INFO] - Sensor Can ID Not In DB, Adding: <strong>". $sensorCanID . "</strong><br />";
        $addSensorCanID = 1;
      } else {
        echo "<strong>[ERROR]</strong> - Sensor Can ID Is Empty <br />";
      }

      if (isset($_POST['notypeid']) == 'notypeid')
      {
        echo "NO TYPE ID CHECKED.";
        $notypeid = $_POST['notypeid'];

        #Sensor Description Grab And Set
        if (isset($_POST['sensordescription'])){
          $sensordescription = sanitise_input($_POST['sensordescription']);
          $addsensordescription = 1;
        }
      }
      elseif ($_POST['sensortypeID'] == "none")
      {
        echo "[ERROR] - No Type Id Is Set To None! (did you mean to check the No Sensory Type ID Checkbox)";
      } elseif ($_POST['sensortypeID'] >= "1") {
        $sensortypeid = $_POST['sensortypeID'];
        echo "[INFO] - Pre Made Sensor ID Set To: ". $sensortypeid = $_POST['sensortypeID'];
        $addSensorTypeID = 1;
        $addsensordescription = 0;
        $addUnitID = 0;
        $addUnitName = 0;
        $addUnitMetric = 0;
      }

      if ($_POST['sensortypeID'] == "none"){

      }














        ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);

   ?>

      </body>
      </html>
