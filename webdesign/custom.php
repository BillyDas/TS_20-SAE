<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8" />
    <title>SAE Data App</title>
    <link rel="stylesheet" type="text/css" media="screen" href="main2.css" />
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.1/css/bootstrap.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-select/1.13.1/css/bootstrap-select.css" />
    <link rel="stylesheet" type="text/css" href="styles/style.css">
    <script src="https://d3js.org/d3.v5.min.js"></script>
    <script src="scripts/loadData.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.1.1/js/bootstrap.bundle.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-select/1.13.1/js/bootstrap-select.min.js"></script>
    <?php require "fnSensorsList.php" ?>
</head>

<body>
    <?php include "navbarContents.php" ?>
    <div id="main">
        <h1>Custom Visualisation</h1>
        <div id="graph">
            <div id="chart"></div>
            <div id="focus"></div>
            <script src="scripts/lines.js"></script>
        </div>
        <div id="settings">
            <label>X-Axis Sensors: </label>
            <select id="xAxisSelectPicker" class="selectpicker" multiple data-live-search="true">
                <option value="" disabled>Choose x-axis sensors</option>
                <?php echoSensors() ?>
            </select>
            &nbsp;&nbsp;&nbsp;&nbsp;
            <label>Y-Axis Sensors: </label>
            <select id="yAxisSelectPicker" class="selectpicker" multiple data-live-search="true">
                <option value="" disabled>Choose y-axis sensors</option>
                <?php echoSensors() ?>
            </select>
        </div>
    </div>
</body>

</html>