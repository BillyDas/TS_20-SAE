
function initSensorSettings(){
    $('#customCanId').hide();

    $('#addButton').click(function(){
        handleButtonClick();
    });

    $('#spCanId').on('changed.bs.select', function () {
        handleCanIdChange();
     });
}

function handleButtonClick(){
    $('.addSensor').show();
    $('.updateSensor').hide();
    $('#sensorSettings').modal('show');
}

function handleCanIdChange(){
    if ($('#spCanId').val() == "custom"){
        $('#customCanId').show();
    }
}

window.onload = initSensorSettings;