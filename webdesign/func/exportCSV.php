<?php
    $connect = mysqli_connect("ts20.billydasdev.com", "ts20", "ts20", "ts20");
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename=RaceCarData.csv');
    $output = fopen("php://output", "w");
    fputcsv($output, array('SensorDataId', 'CanId', 'Data', 'UTCTimestamp'));
    $query = "SELECT * from SensorData";
    $result = mysqli_query($connect, $query);
    while($row = mysqli_fetch_assoc($result))
    {
      fputcsv($output, $row);
    }
    fclose($output);
?>