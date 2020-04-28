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
                        echo('<a href="layout.php?id='.$row['SensorTypeId'].'"><img src="cronch.png" alt="cronch" id="pic"><span id="inlinespan">'.$row["Name"].'</span></a>');
                    }
                }
            ?>
        </div>
        <div id="main">
                <?php
                    include "dbconn.php";
                    $conn = new mysqli($servername, $username, $password, $dbname);
                    if ($conn->connect_error) {
                        die("Connection failed: " . $conn->connect_error);
                    }
                    $sql = "SELECT * FROM Sensors WHERE SensorTypeId = " . $_GET["id"];
                    $result = $conn->query($sql);

                    if ($result->num_rows > 0)
                    {
                        $row = $result->fetch_assoc();
                        echo("<h1>".$row["Name"]."</h1>");
                    }
                    
                    $sql = "SELECT * FROM SensorType WHERE SensorTypeId = " . $_GET["id"];
                    $result = $conn->query($sql);
                    if ($result->num_rows > 0)
                    {
                        $row = $result->fetch_assoc();
                        echo("<p>".$row["Description"]."</p>");
                    }
                ?>
            <img src="cronch.png" alt="cronch" id="pic">
        </div>
    </body>
</html>
