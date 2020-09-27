<?php
require_once('dbconn.php');
$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$stmt = "SELECT `UnitId`, `UnitName`, `UnitMetric` FROM `SensorUnit`";

if ($result = $conn->query($stmt)) {

    /* fetch object array */
    while ($row = $result->fetch_assoc()) {
        printf ('<option value="%s">%s (%s)</option>', $row['UnitId'], $row['UnitName'], $row['UnitMetric']);
    }

    /* free result set */
    $result->close();
}

?>
