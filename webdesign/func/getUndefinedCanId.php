<?php
require_once('dbconn.php');
$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$stmt = "SELECT SensorData.CanId FROM SensorData WHERE SensorData.CanId NOT IN (SELECT Sensors.CanId FROM Sensors) GROUP BY SensorData.CanId";

if ($result = $conn->query($stmt)) {

    /* fetch object array */
    while ($row = $result->fetch_assoc()) {
        printf ('<option value="%s">%s</option>', $row['CanId'], $row['CanId']);
    }

    /* free result set */
    $result->close();
}

?>
