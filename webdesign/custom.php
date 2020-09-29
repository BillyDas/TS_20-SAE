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
    <?php include "inc/settingsModal.html" ?>
    <div id="main">
        <div id="alert"></div>
        <h1>Custom Visualisation</h1>
        <hr/>
        <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#settingsModal">
            <i class="fa fa-cog"></i> Settings
        </button>
        
        <div id="graph">
			<div id="loadingGraph" style="display:none;">
				<img id="loadingImg" src="" />
				<br/>
				Loading...
			</div>
            <div id="chart"></div>
            <div id="focus"></div>
            <script src="scripts/lines.js"></script>
        </div>
    </div>
</body>
</html>