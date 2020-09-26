var undefinedCanIds = null;
var avaliableUnits = null;
var _errorMessage = "";

function initSensorSettings() {
    $('#customCanId').hide();
    $('#customUnit').hide();

    $('#sensorTable tr').click(function () {
        handleRowClick(this);
    });

    $('#sensorTable').DataTable().on('draw', function () {
        $('#sensorTable tr').click(function () {
            handleRowClick(this);
        });
    });

    $('#addButton').click(function () {
        handleButtonClick();
    });

    $('#spCanId').on('changed.bs.select', function () {
        handleCanIdChange();
    });

    $('#spUnit').on('changed.bs.select', function () {
        handleUnitChange();
    });

    $('#btnAddSettings').click(function () {
        addSensor();
    });

    $('#btnDeleteSettings').click(function () {
        deleteSensor();
    });

    $('#btnSaveSettings').click(function () {
        updateSensor();
    });



    initSelectPickers();
}

function handleButtonClick() {
    resetCanIdSelectPicker();
    resetUnitSelectPicker();
    $('#spCanId').selectpicker('val', '');
    $('#txtName').val("");
    $('#txtDescription').val("");
    $('#txtUnitName').val("");
    $('#txtUnitMetric').val("");
    $('#spUnit').selectpicker('val', '');
    $('.addSensor').show();
    $('.updateSensor').hide();
    $('#sensorSettings').modal('show');
}

function handleCanIdChange() {
    if ($('#spCanId').val() == "custom") {
        $('#customCanId').show();
    }
    else {
        $('#customCanId').hide();
    }
}

function handleUnitChange() {
    if ($('#spUnit').val() == "custom") {
        $('#customUnit').show();
    }
    else {
        $('#customUnit').hide();
    }
}

function handleRowClick(row) {
    if (row.id != "cols") {
        var data = [];
        for (var i = 0; i < row.children.length; i++) {
            data.push(row.children[i].innerHTML);
        }
        resetCanIdSelectPicker(data[0]);
        resetUnitSelectPicker(true);
        $('.addSensor').hide();
        $('.updateSensor').show();
        $('#spCanId').selectpicker('val', data[0]);
        $('#txtName').val(data[1]);
        $('#txtDescription').val(data[2]);
        $('#spUnit').selectpicker('val', data[5]);
        $('#txtSensorTypeId').val(data[6])
        $('#sensorSettings').modal('show');
    }
}

function resetCanIdSelectPicker(extraOption) {
    if (extraOption != null) {
        var extra = '<option value="' + extraOption + '">' + extraOption + '</option>';
        $('#spCanId').html('<option value="custom">Custom</option>' + extra + undefinedCanIds);
    }
    else {
        $('#spCanId').html('<option value="custom">Custom</option>' + undefinedCanIds);
    }
    $('#spCanId').selectpicker('refresh');
}

function resetUnitSelectPicker(removeCustom) {
    if (removeCustom) {
        $('#spUnit').html(avaliableUnits);
    }
    else {
        $('#spUnit').html('<option value="custom">Custom</option>' + avaliableUnits);
    }
    $('#spUnit').selectpicker('refresh');
}

function initSelectPickers() {
    $.ajax({
        url: "func/getUndefinedCanId.php",
        type: 'post',
        success: function (response) {
            undefinedCanIds = response;
            resetCanIdSelectPicker();
        }
    });

    $.ajax({
        url: "func/getUnits.php",
        type: 'post',
        success: function (response) {
            avaliableUnits = response;
            resetUnitSelectPicker();
        }
    });
}

function addSensor() {
    if (validateForm()) {
        $('#btnAddSettings').hide();
        $('#btnLoading').show();
        if ($('#spCanId').val() == "custom") {
            canIdVal = $('#txtCanId').val();
        }
        else {
            canIdVal = $('#spCanId').val();
        }
        if ($('#spUnit').val() == "custom") {
            data = {
                Mode: 'add',
                CanId: canIdVal,
                Name: $('#txtName').val(),
                Description: $('#txtDescription').val(),
                UnitName: $('#txtUnitName').val(),
                UnitMetric: $('#txtUnitMetric').val()
            };
        }
        else {
            data = {
                Mode: 'add',
                CanId: canIdVal,
                Name: $('#txtName').val(),
                Description: $('#txtDescription').val(),
                UnitId: $('#spUnit').val()
            };
        }
        requestModification(data);
    }
    else {
        $("#settings input[id*='txt']").change(function () {
            validateForm();
        });
        $('#spCanId').on('changed.bs.select', function () {
            validateForm();
        });

        $('#spUnit').on('changed.bs.select', function () {
            validateForm();
        });
    }
}

function updateSensor() {
    if (validateForm()) {
        $('#btnSaveSettings').hide();
        $('#btnLoading').show();
        if ($('#spCanId').val() == "custom") {
            canIdVal = $('#txtCanId').val();
        }
        else {
            canIdVal = $('#spCanId').val();
        }
        data = {
            Mode: 'update',
            CanId: canIdVal,
            Name: $('#txtName').val(),
            Description: $('#txtDescription').val(),
            UnitId: $('#spUnit').val(),
            SensorTypeId: $('#txtSensorTypeId').val()
        };

        requestModification(data);
    }
    else {
        $("#settings input[id*='txt']").change(function () {
            validateForm();
        });
        $('#spCanId').on('changed.bs.select', function () {
            validateForm();
        });

        $('#spUnit').on('changed.bs.select', function () {
            validateForm();
        });
    }
}

function deleteSensor() {
    data = {
        Mode: 'delete',
        CanId: $('#spCanId').val(),
    };
    requestModification(data);
}

function requestModification(formData) {
    $.ajax({
        type: "POST",
        url: "modifySensor.php",
        timeout: 3000,
        data: formData,
        complete: async function (jqXHR, status) {
            if (jqXHR.status == 200) {
                //console.log(jqXHR);
                sessionStorage.setItem('responseMessage', jqXHR.responseText);
                location.reload();
            }
            else {
                if (status == "timeout") {
                    showErrorMessage("Request Timed out.");
                }
                else {
                    if (jqXHR.responseText != "") {
                        if (jqXHR.responseText.includes('Error: Duplicate entry')) {
                            sessionStorage.setItem('responseMessage', '1 Row Updated. (Cannot Update Linked Sensor)');
                            location.reload();
                        }
                        else {
                            showErrorMessage(jqXHR.responseText.split(': ')[1]?.replace('!', ''));
                        }
                    }
                    else {
                        showErrorMessage("Unknown Error Occured");
                    }

                }
            }
        }
    });
}

function validateForm() {
    var result = true;

    if ($('#spCanId').val() == "") {
        result = false;
        addInvalidClass($('#spCanId'));
    }
    else {
        clearValidation($('#spCanId'));
    }

    if ($('#spCanId').val() == "custom") {
        if ($('#txtCanId').val() == "") {
            result = false;
            addInvalidClass($('#txtCanId'));
        }
        else {
            clearValidation($('#txtCanId'));
        }
    }

    if ($('#txtName').val() == "") {
        result = false;
        addInvalidClass($('#txtName'));
    }
    else {
        clearValidation($('#txtName'));
    }

    if ($('#txtDescription').val() == "") {
        result = false;
        addInvalidClass($('#txtDescription'));
    }
    else {
        clearValidation($('#txtDescription'));
    }

    if ($('#spUnit').val() == "") {
        result = false;
        addInvalidClass($('#spUnit'));
    }
    else {
        clearValidation($('#spUnit'));
    }

    if ($('#spUnit').val() == "custom") {
        if ($('#txtUnitName').val() == "") {
            result = false;
            addInvalidClass($('#txtUnitName'));
        }
        else {
            clearValidation($('#txtUnitName'));
        }

        if ($('#txtUnitMetric').val() == "") {
            result = false;
            addInvalidClass($('#txtUnitMetric'));
        }
        else {
            clearValidation($('#txtUnitMetric'));
        }
    }
    return result;
}

function addInvalidClass(element) {
    if (element.is('select')) {
        element = element.parent();
    }

    if (!element.attr('class').includes('is-invalid')) {
        element.addClass('is-invalid');
    }
}

function clearValidation(element) {
    if (element.is('select')) {
        element = element.parent();
    }

    if (element.attr('class').includes('is-invalid')) {
        element.removeClass('is-invalid');
    }
}

function showErrorMessage(message) {
    window._errorMessage = message;
    $('#errorAlert').load('inc/errorAlert.html');
    setTimeout(function () {
        $('#errorMsg').empty();
        $('#errorMsg').html(window._errorMessage);
    }, 50);
    setTimeout(function () {
        $('#btnLoading').hide();
        if ($('#sensorModalTitleAdd').attr('style').includes('display: none')) {
            $('#btnSaveSettings').show();
        }
        else {
            $('#btnAddSettings').show();
        }

    }, 1000);
}

window.onload = initSensorSettings;