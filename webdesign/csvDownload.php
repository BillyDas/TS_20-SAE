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
      <form style="text-align: center;" method="post" action="func/exportCSV.php" align="center">
        <input type="submit" name="export" value="CSV Export" class="btn btn-success" />
      </form>
    </div>
</body>
</html>
