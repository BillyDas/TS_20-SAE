<?php
    # Attempt to resolve db host (if using docker should resolve internally) otherwise use the external host
    #if (gethostbyname('db') == 'db'){
    #    $servername = $_SERVER['SERVER_NAME'];
    #}
    #else{
    #    $servername = 'db';
    #}
    
    # local dev override for 2020
    $servername = "ts20.billydasdev.com";
    
    $username = "ts20";
    $password = "ts20";
    $dbname = "ts20";
?>