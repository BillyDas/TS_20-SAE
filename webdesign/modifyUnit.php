<?php
require_once('func/dbconn.php');
require_once('func/sanitize.php');
$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

if (isset($_POST["Mode"])) {
    switch ($_POST["Mode"]) {
        case 'add':
            addUnit($conn);
            break;
        
        case 'update':
            updateUnit($conn);
            break;
        
        case 'delete':
            deleteUnit($conn);
            break;

        default:
            trigger_error("Unknown Type!");
            break;
    }
}

function addUnit($conn)
{
    if (isset($_POST["UnitName"]) && isset($_POST["UnitMetric"])) {
        $UnitName = sanitizeData($_POST["UnitName"]);
        $UnitMetric = sanitizeData($_POST["UnitMetric"]);

        $stmt = $conn->prepare("INSERT INTO `SensorUnit` (`UnitName`, `UnitMetric`) VALUES (?, ?)");
        $stmt->bind_param('ss', $UnitName, $UnitMetric);
        $stmt->execute() or trigger_error("Query Failed! Error: " . mysqli_error($conn), E_USER_ERROR);
        printf("%d Row inserted.\n", $stmt->affected_rows);
    }
}

function updateUnit($conn)
{
    if (isset($_POST["UnitId"]) && isset($_POST["UnitName"]) && isset($_POST["UnitMetric"])) {
        $UnitId = sanitizeData($_POST["UnitId"]);
        $UnitName = sanitizeData($_POST["UnitName"]);
        $UnitMetric = sanitizeData($_POST["UnitMetric"]);

        $stmt = $conn->prepare("UPDATE `SensorUnit` SET `UnitName` = ?, `UnitMetric` = ? WHERE `SensorUnit`.`UnitId` = ?");
        $stmt->bind_param('ssi', $UnitName, $UnitMetric, $UnitId);
        $stmt->execute() or trigger_error("Query Failed! Error: " . mysqli_error($conn), E_USER_ERROR);
        $conn->commit();
        printf("%d Row updated.\n", $stmt->affected_rows);
    }
}

function deleteUnit($conn)
{
    if (isset($_POST["UnitId"])) {
        $UnitId = sanitizeData($_POST["UnitId"]);

        $stmt = $conn->prepare("DELETE FROM `SensorUnit` WHERE `SensorUnit`.`UnitId` = ?");
        $stmt->bind_param('i', $UnitId);
        $stmt->execute() or trigger_error("Query Failed! Error: " . mysqli_error($conn), E_USER_ERROR);
        $conn->commit();
        printf("%d Row deleted.\n", $stmt->affected_rows);
    }
}


?>
