<?php
require_once('func/dbconn.php');
require_once('func/sanitize.php');
require_once('func/printError.php');
$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

if (isvalid($_POST["Mode"])) {
    switch ($_POST["Mode"]) {
        case 'add':
            addSensor($conn);
            break;
        
        case 'update':
            updateSensor($conn);
            break;
        
        case 'delete':
            deleteSensor($conn);
            break;

        default:
            printError("Unknown Type!");
            break;
    }
}
else{
    printError("mode not set!");
}

function addSensor($conn)
{
    if (isvalid($_POST["CanId"]) && isvalid($_POST["Name"]) && isvalid($_POST["Description"])) {
        $CanId = sanitizeData($_POST["CanId"]);
        $Name = sanitizeData($_POST["Name"]);
        $Description = sanitizeData($_POST["Description"]);

        if (isvalid($_POST["UnitId"])){
            $UnitId = sanitizeData($_POST["UnitId"]);
        }
        else if (isvalid($_POST["UnitName"]) && isvalid($_POST["UnitMetric"])){
            $UnitName = sanitizeData($_POST["UnitName"]);
            $UnitMetric = sanitizeData($_POST["UnitMetric"]);
    
            $stmt = $conn->prepare("INSERT INTO `SensorUnit` (`UnitName`, `UnitMetric`) VALUES (?, ?)");
            $stmt->bind_param('ss', $UnitName, $UnitMetric);
            if($stmt->execute()){
                $UnitId = $conn->insert_id;
            }
            else{
                printError("Query Failed! Error: " . mysqli_error($conn), E_USER_ERROR);
            }
        }
        $stmt = $conn->prepare("INSERT INTO `SensorType` (`Description`, `UnitId`) VALUES (?, ?)");
        $stmt->bind_param('si', $Description, $UnitId);
        if($stmt->execute()){
            $SensorTypeId = $conn->insert_id;
        }
        else{ 
            printError("Query Failed! Error: " . mysqli_error($conn), E_USER_ERROR);
        }
        $stmt = $conn->prepare("INSERT INTO `Sensors` (`CanId`, `Name`, `SensorTypeId`) VALUES (?, ?, ?)");
        $stmt->bind_param('ssi', $CanId, $Name, $SensorTypeId);
        $stmt->execute() or printError("Query Failed! Error: " . mysqli_error($conn), E_USER_ERROR);
        //commit all changes!!!!
        printf("%d Row inserted.\n", $stmt->affected_rows);
    }
    else{
        printError("required values not set!");
    }
}

// TO BE FIXED STILL COPIED FROM UNIT UPDATE
function updateSensor($conn)
{
    if (isvalid($_POST["CanId"]) && isvalid($_POST["Name"]) && isvalid($_POST["Description"]) && isvalid($_POST["UnitId"]) && isvalid($_POST["SensorTypeId"])) {
        $CanId = sanitizeData($_POST["CanId"]);
        $Name = sanitizeData($_POST["Name"]);
        $Description = sanitizeData($_POST["Description"]);
        $UnitId = sanitizeData($_POST["UnitId"]);
        $SensorTypeId = sanitizeData($_POST["SensorTypeId"]);

        $stmt = $conn->prepare("UPDATE `SensorType` SET `Description` = ?, `UnitId` = ? WHERE `SensorType`.`SensorTypeId` = ?");
        $stmt->bind_param('sii', $Description, $UnitId, $SensorTypeId);
        $stmt->execute() or printError("Query Failed! Error: " . mysqli_error($conn), E_USER_ERROR);
        $conn->commit();
        $affRows = $stmt->affected_rows;
        $stmt = $conn->prepare("UPDATE `Sensors` SET `CanId` = ?, `Name` = ? WHERE `Sensors`.`SensorTypeId` = ?");
        $stmt->bind_param('ssi', $CanId, $Name, $SensorTypeId);
        $stmt->execute() or printError("Query Failed! Error: " . mysqli_error($conn), E_USER_ERROR);
        $conn->commit();
        printf("%d Row updated.\n", $stmt->affected_rows + $affRows);
    }
}

function deleteSensor($conn)
{
    if (isvalid($_POST["CanId"])) {
        $CanId = sanitizeData($_POST["CanId"]);
        $SensorTypeId = null;
        $stmt = $conn->prepare("SELECT `SensorTypeId` FROM `Sensors` WHERE `CanId` = ?");
        $stmt->bind_param('s', $CanId);
        $stmt->execute() or printError("Query Failed! Error: " . mysqli_error($conn), E_USER_ERROR);
        ($stmt_result = $stmt->get_result()) or printError($stmt->error, E_USER_ERROR);
        if ($stmt_result->num_rows>0) {
            if($row = $stmt_result->fetch_assoc()) {
                $SensorTypeId = $row['SensorTypeId'];
            }
            else{
                printError('Error: Unable to Fetch SensorTypeId');
            }
        }
        $rowDeleted = 0;
        $stmt = $conn->prepare("DELETE FROM `Sensors` WHERE `Sensors`.`CanId` = ?");
        $stmt->bind_param('s', $CanId);
        $stmt->execute() or printError("Query Failed! Error: " . mysqli_error($conn), E_USER_ERROR);
        $conn->commit();
        $rowDeleted = $stmt->affected_rows;
        $stmt = $conn->prepare("DELETE FROM `SensorType` WHERE `SensorType`.`SensorTypeId` = ?");
        $stmt->bind_param('i', $SensorTypeId);
        $stmt->execute() or printError("Query Failed! Error: " . mysqli_error($conn), E_USER_ERROR);
        $conn->commit();
        printf("%d Row deleted.\n", $stmt->affected_rows + $rowDeleted);
    }
}


?>
