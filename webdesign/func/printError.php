<?php

function printError($msg){
    printf("Error: %s", $msg);
    http_response_code(400);
    exit(0);
}

function isvalid($val){
    if (isset($val)){
        if ($val != ""){
            return true;
        }
    }
    return false;
}

?>