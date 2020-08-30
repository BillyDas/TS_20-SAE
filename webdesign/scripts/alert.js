function initAlert() {
    //setup event listener for sensor selection change
    $('#yAxisSelectPicker').change(function () {
        selectPickerUpdate(this);
    });

    //setup event listener for sensor selection change
    $('#xAxisSelectPicker').change(function () {
        selectPickerUpdate(this);
    });

    //No Sensors Loaded Initially so display alert
    $("#alert").load("inc/sensorAlert.html");
}

function selectPickerUpdate(picker){
    if ($("#" + picker.id).val() == ""){
        $("#alert").load("inc/sensorAlert.html");
    }
    else{
        $("#alert").empty();
    }
}

$(document).ready(function(){
    initAlert();
});