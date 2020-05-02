<!DOCTYPE html>
<html lang="en">
<head>
   <meta charset="utf-8" />
   <meta name="description" content="TS_20 Show Sensors From Database" />
   <meta name="keywords" content="PHP" />
   <meta name="author" content="Billy Dasopatis / 101156315" />
   <title>Display Session Data</title>
</head>
<body>
   <h1>List of all sensors in the database.</h1>
   <hr>
   <?php
      require_once('databasedetails.php');

//-----------------------Function Definition-------------------------
      //this function is to print out the TOP half of the table
      function printdatapre(){
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
      function printdata($result){
        if ($result != null)
        {
          while ($row = mysqli_fetch_assoc($result))
          {
             echo "<td>",$row['CanId'],"</td>\n";
             echo "<td>",$row['Name'],"</td>\n";
             echo "<td>",$row['SensorTypeId'],"</td>\n";
             echo "</tr>\n ";
          }
        }
      	}

//------------------------End Of Function Definition------------------
      if (mysqli_connect_errno())
     {
         echo "Failed to connect to MySQL: " . mysqli_connect_error();
         //you need to exit the script, if there is an error
         exit();

     } else {
       $query = "SELECT * FROM sensors";
       $results = mysqli_query($conn, $query) or trigger_error("Query Failed! SQL: $query - Error: ".mysqli_error($conn), E_USER_ERROR);
       printdatapre();
       printdata($results);
       printdatapost();
     }

     ini_set('display_errors', 1);
     ini_set('display_startup_errors', 1);
     error_reporting(E_ALL);

   ?>


</body>
</html>
