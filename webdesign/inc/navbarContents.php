<div id="navbar">
  <link rel="stylesheet" href="styles/navbar.css">
    <img src="img/TS_20-ClearRed.png" id="logo"><p>TS20 FSAE<br> Data App</p>
  <p style="text-align: center;"> Current Temperature </p>
    <?php
        $json = file_get_contents("http://api.openweathermap.org/data/2.5/weather?q=Melbourne,au&units=metric&APPID=fda2109659faa71995bdd900e8a6674a");
        $data = json_decode($json);
        $currentTemp = round($data->main->temp);

        echo "<div class='progress w3-grey'>";
        echo "    <div class='progress-bar bg-info w3-green' style='width: " . $currentTemp * 2 ."%' role='progressbar' aria-valuenow='0' aria-valuemin='-5' aria-valuemax='50'>$currentTemp °C</div>";
        echo "</div>";
    ?>
    <a href="index.php"><i class="fa fa-home"></i><span id="inlinespan">Home</span></a>
    <hr>
    <span id="inlinespan" class="menuheading">Interaction Diagrams</span>
    <a href="custom.php"><img src="img/custom.png" id="pic"><span id="inlinespan">Custom Visualisation</span></a>
    <a href="accumulators.php"><img src="img/accandvoltage.png" id="pic"><span id="inlinespan">Accumulator Voltage</span></a>
    <a href="batteriesMotors.php"><img src="img/engandbat.png" id="pic"><span id="inlinespan">Batteries and Motors</span></a>
    <a href="rpmTorque.php"><img src="img/rpmtorque.png" id="pic"><span id="inlinespan">RPM and Torque</span></a>
    <hr>
    <span class="menuheading" id="inlinespan">Database Links</span>
    <a href="sensors.php"><i class="fa fa-plug" aria-hidden="true"></i><span id="inlinespan">Sensors</span></a>
    <a href="units.php"><i class="fa fa-list" aria-hidden="true"></i><span id="inlinespan">Units</span></a>
    <a href="csvDownload.php"><i class="fa fa-table" aria-hidden="true"></i><span id="inlinespan">Download CSV</span></a>
</div>
