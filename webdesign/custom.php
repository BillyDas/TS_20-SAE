<!DOCTYPE html>
<html>

<head>
    <title>SAE Data App</title>
    <?php require "inc/head.html" ?>
    <link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css">
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
		
		<div>
			<button type="button" class="btn btn-primary" data-toggle="modal" data-target="#settingsModal">
				<i class="fa fa-cog"></i> Settings
			</button>

			<div class="overlay"></div>
			<div id="graph">
				<div id="loadingGraph" style="display:none;">
					Run Billy, run!
					<br/>
					<img src="https://cdn.discordapp.com/attachments/691821735124795448/761133806655635476/RUNBILLYRUN.gif" />
					<br/>
					Loading...
				</div>
				<div id="chart"></div>
				<div id="focus"></div>
				<script src="scripts/lines.js"></script>
			</div>
			<span id="overlay"></span>
		</div>
    </div>
</body>
</html>
