<!DOCTYPE html>
<html>

<head>
    <title>SAE Data App</title>
    <?php require "inc/head.html" ?>
    <script src="scripts/alert.js"></script>
    <?php require "func/fnSensorsList.php" ?>
</head>

<body>
    <?php include "inc/navbarContents.php" ?>
    <div id="main">
        <div id="alert"></div>
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