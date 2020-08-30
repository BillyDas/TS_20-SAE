<!DOCTYPE html>
<html>

<head>
    <title>SAE Data App</title>
    <?php require "inc/head.html" ?>
    <?php require "func/fnSensorsList.php" ?>
</head>

<body>
    <?php include "inc/navbarContents.php" ?>
    <div class="alert alert-warning" role="alert">
        <h4 class="alert-heading">Select Sensors!</h4>
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
        </button>
        <p>Please select sensors for the x and y axis to graph.</p>
    </div>
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
                <option value="Time" disabled selected>Time</option>
                <!--<?php echoSensors() ?> -->
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