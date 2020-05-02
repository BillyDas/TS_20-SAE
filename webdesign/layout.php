<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8" />
        <title>SAE Data App</title>
        <link rel="stylesheet" type="text/css" media="screen" href="main2.css" />
    </head>
    <body>
        <div id="navbar">
            <p>TS FSAE Data App</p>
            <a href="layout.php"><img src="cronch.png" alt="cronch" id="pic"><span id="inlinespan">Custom</span></a>
        </div>
        <div id="main">
            <h1>Custom Visualisation</h1>
            <img src="cronch.png" alt="cronch" id="pic">
            <form>
                <fieldset>
                    <legend>X Axis</legend>
                    <?php
                        //dynamic list that takes sensors from sensordata.
                        include "dbconn.php";
                        $conn = new mysqli($servername, $username, $password, $dbname);
                        if ($conn->connect_error) {
                            die("Connection failed: " . $conn->connect_error);
                        }
                        $sql = "SELECT * FROM Sensors";
                        $result = $conn->query($sql);

                        if ($result->num_rows > 0)
                        {
                            while($row = $result->fetch_assoc())
                            {
                                //checkbox for each sensor follows format - (name, SensorTypeId) = id, (value) = name.
                                echo('<input type="checkbox" id="'.$row["SensorTypeId"].'" name ="'.$row["SensorTypeId"].'>
                                    <label for="'.$row["SensorTypeId"].'">'.$row["Name"].'</label><br>');
                            }
                        }
                    ?>
                </fieldset id="yAx">
                <fieldset>
                    <legend>Y Axis</legend>
                    <?php
                        //dynamic list that takes sensors from sensordata.
                        include "dbconn.php";
                        $conn = new mysqli($servername, $username, $password, $dbname);
                        if ($conn->connect_error) {
                            die("Connection failed: " . $conn->connect_error);
                        }
                        $sql = "SELECT * FROM Sensors";
                        $result = $conn->query($sql);

                        if ($result->num_rows > 0)
                        {
                            while($row = $result->fetch_assoc())
                            {
                                //checkbox for each sensor follows format - (name, SensorTypeId) = id, (value) = name.
                                echo('<input type="checkbox" id="'.$row["SensorTypeId"].'" name ="'.$row["SensorTypeId"].'>
                                    <label for="'.$row["SensorTypeId"].'">'.$row["Name"].'</label><br>');
                            }
                        }
                    ?>
                </fieldset>
            </form>
        </div>
    </body>
</html>
