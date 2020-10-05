<!DOCTYPE html>
<html>

<head>
    <title>SAE Data App</title>
    <?php require "inc/head.html" ?>
</head>

<body>
    <?php include "inc/navbarContents.php" ?>
    <div id="main">
      <h1 style="text-align: center;"> Download ALL RAW DATA in the database as CSV </h1>
      <h2 style="text-align: center;"> Please be patient as the page generates the required data </h2>
      <h2 style="text-align: center;"> The more data in the database the longer it will take </h2>
      <form style="text-align: center;" method="post" action="csvDownload.php" align="center">
        <input type="submit" name="export" value="CSV Export" class="btn btn-success" />
      <?php
     //export.php
      if(isset($_POST["export"]))
      {
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
}
?>
      </div>
</body>

</html>
