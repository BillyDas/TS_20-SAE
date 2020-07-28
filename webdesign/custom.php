<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8" />
        <title>SAE Data App</title>
        <link rel="stylesheet" type="text/css" media="screen" href="main2.css" />
        <script src="collectAxisSelection.js"></script>
    </head>
    <body>
        <?php include "navbarContents.php" ?>
        <div id="main">
            <h1>Custom Visualisation</h1>
            <img src="cronch.png" alt="cronch" id="pic">
            <form onsubmit="return false;">
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
                                //radio for each sensor follows format - (name, SensorTypeId) = id, (value) = name.
                                echo('<input type="radio" id="'.$row["SensorTypeId"].'" value ="'.$row["SensorTypeId"].'" name ="xAx" class="xAx">
                                    <label for="xAx">'.$row["Name"].'</label><br>');
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
                                //radio for each sensor follows format - (name, SensorTypeId) = id, (value) = name.
                                echo('<input type="radio" id="'.$row["SensorTypeId"].'" value ="'.$row["SensorTypeId"].'" name ="yAx" class="yAx">
                                    <label for="yAx">'.$row["Name"].'</label><br>');
                            }
                        }
                    ?>
                </fieldset>
                <input type="submit" id="button" value="Update">
            </form>
        </div>
    </body>
</html>
