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
            <table>
                <tr>
                    <td colspan="2">
                        <label for="xAxisSelectPicker">X-Axis Sensors: </label>
                        <select id="xAxisSelectPicker" class="selectpicker" multiple data-live-search="true">
                            <option value="" disabled>Choose x-axis sensors</option>
                            <option value="Time" disabled selected>Time</option>
                            <!--<?php echoSensors() ?> -->
                        </select>
                    </td>
                    <td colspan="2">
                        <label for="yAxisSelectPicker">Y-Axis Sensors: </label>
                        <select id="yAxisSelectPicker" class="selectpicker" multiple data-live-search="true">
                            <option value="" disabled>Choose y-axis sensors</option>
                            <?php echoSensors() ?>
                        </select>
                    </td>
                </tr>
                <tr>
                    <td>
                        <label for="startDateTime">Start: </label>
                    </td>
                    <td>
                        <div class="input-group date" id="startDateTime" data-target-input="nearest">
                            <input type="text" class="form-control datetimepicker-input" data-target="#startDateTime">
                            <div class="input-group-append" data-target="#startDateTime" data-toggle="datetimepicker">
                                <div class="input-group-text"><i class="fa fa-calendar"></i></div>
                            </div>
                        </div>
                    </td>
                    <td>
                        <label for="endDateTime">End: </label>
                    </td>
                    <td>
                        <div class="input-group date" id="endDateTime" data-target-input="nearest">
                            <input type="text" class="form-control datetimepicker-input" data-target="#endDateTime">
                            <div class="input-group-append" data-target="#endDateTime" data-toggle="datetimepicker">
                                <div class="input-group-text"><i class="fa fa-calendar"></i></div>
                            </div>
                        </div>
                    </td>
                </tr>
            </table>
        </div>
        <script type="text/javascript">
            $(function() {
                $('#startDateTime').datetimepicker();
                $('#endDateTime').datetimepicker({
                    useCurrent: false
                });
                $("#startDateTime").on("change.datetimepicker", function(e) {
                    $('#endDateTime').datetimepicker('minDate', e.date);
                });
                $("#endDateTime").on("change.datetimepicker", function(e) {
                    $('#startDateTime').datetimepicker('maxDate', e.date);
                });
            });
        </script>
    </div>
</body>

</html>