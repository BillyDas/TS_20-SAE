<?php
function echoSensors()
{
    //dynamic list that takes sensors from sensordata.
    include "dbconn.php";
    $conn = new mysqli($servername, $username, $password, $dbname);
    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }
    $sql = "SELECT * FROM Sensors";
    $result = $conn->query($sql);
    $selectOptions = "";

    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            echo ('<option value="' . $row["CanId"] . '">' . $row["Name"] . '</option>');
        }
    }
}
?>