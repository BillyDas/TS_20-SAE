<?php
  require_once('dbconn.php');
  $conn = new mysqli($servername, $username, $password, $dbname);
  if ($conn->connect_error) {
      die("Connection failed: " . $conn->connect_error);
  }  
  header('Content-Type: text/csv; charset=utf-8');
  header('Content-Disposition: attachment; filename=RaceCarData.csv');
  $output = fopen("php://output", "w");
  fputcsv($output, array('SensorDataId', 'CanId', 'Data', 'UTCTimestamp'));
  $query = "SELECT * from SensorData";
  $result = mysqli_query($conn, $query);
  while($row = mysqli_fetch_assoc($result))
  {
    fputcsv($output, $row);
  }
  fclose($output);
?>