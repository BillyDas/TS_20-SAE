<?php

//Function to sanitize form data before it is used in queries to prevent SQL injection.
function sanitizeData($data){
    $res = htmlspecialchars($data);
    $res = str_replace("\n","", $res);
    
    return $res;    
}

?>