<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8" />
    <meta name="description" content="TS_20 Sensors" />
    <title>Sensors</title>
    <?php require "inc/head.html" ?>
    <link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/1.10.21/css/dataTables.bootstrap4.min.css">
    <script src="https://cdn.datatables.net/1.10.21/js/jquery.dataTables.min.js"></script>
    <script src="https://cdn.datatables.net/1.10.21/js/dataTables.bootstrap4.min.js"></script>
</head>

<?php
require_once('func/dbconn.php');
$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

function printRows($result)
{
    if ($result != null) {
        while ($row = mysqli_fetch_assoc($result)) {
            echo '<tr>
                <th scope="row">' . $row['CanId'] . '</th>
                <td>' . $row['Name'] . '</td>
                <td>' . $row['Description'] . '</td>
                <td>' . $row['UnitName'] . '</td>
                <td>' . $row['UnitMetric'] . '</td>
              </tr>';
        }
    }
}

$query  = "SELECT s.CanId, s.Name, st.Description, su.UnitName, su.UnitMetric FROM Sensors AS s INNER JOIN SensorType AS st ON s.SensorTypeId = st.SensorTypeId INNER JOIN SensorUnit AS su ON st.UnitId = su.UnitId";
$results = mysqli_query($conn, $query) or trigger_error("Query Failed! SQL: $query - Error: " . mysqli_error($conn), E_USER_ERROR);

?>

<body>
    <?php include "inc/navbarContents.php" ?>
    <?php include "inc/sensorSettings.html" ?>
    <div id="main" class="mainSensors">
        <h1>Sensors</h1>
        <hr>
        <div id="control">
        <button id="addButton" type="button" class="btn btn-success"><i class="fa fa-plus" aria-hidden="true"></i> Add</button>
        </div>
        <div class="sensorTable">
            <table id="sensorTable" class="table table-striped table-responsive-md">
                <thead>
                    <tr id="cols">
                        <th scope="col">CanId</th>
                        <th scope="col">Name</th>
                        <th scope="col">Description</th>
                        <th scope="col">Unit</th>
                        <th scope="col">Unit Metric</th>
                    </tr>
                </thead>
                <tbody>
                    <?php printRows($results); ?>
                </tbody>
            </table>
        </div>
    </div>
    <script>
        $(document).ready(function() {
            $('#sensorTable').DataTable();
        });
    </script>

</body>

</html>