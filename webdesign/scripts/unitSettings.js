
function initUnitSettings() {
    $('#sensorTable tr').click(function () {
        handleRowClick(this);
    });

    $('#sensorTable').DataTable().on('draw', function () {
        $('#sensorTable tr').click(function () {
            handleRowClick(this);
        });
    });

    $('#addButton').click(function(){
        handleButtonClick();
    });

    $('#btnDeleteSettings').click(function(){
        deleteUnit();
    });

    $('#btnSaveSettings').click(function(){
        updateUnit();
    });

    $('#btnAddSettings').click(function(){
        addUnit();
    });

    $('#unitSettings').on('hidden.bs.modal', function () {
        clearValidation($('#txtName'));
        clearValidation($('#txtMetric'));
      })
}

function handleButtonClick(){
    $('.addUnit').show();
    $('.updateUnit').hide();
    $('#txtId').val('');
    $('#txtName').val('');
    $('#txtMetric').val('');
    $('#unitSettings').modal('show');
}

function handleRowClick(row){
    if (row.id != "cols"){
        var data = [];
        for(var i = 0; i < row.children.length; i++){
            data.push(row.children[i].innerHTML);
        }
        $('.addUnit').hide();
        $('.updateUnit').show();
        $('#txtId').val(data[0]);
        $('#txtName').val(data[1]);
        $('#txtMetric').val(data[2]);
        $('#unitSettings').modal('show');
    }
}

function addUnit(){
    if (validateForm()){
        $('#btnAddSettings').hide();
        $('#btnLoading').show();
        data = {
            Mode: 'add',
            UnitName: $('#txtName').val(),
            UnitMetric: $('#txtMetric').val()
        };
        requestModification(data);
    }
    else {
        $("#settings input[type*='text']").change(function () {
            validateForm();
        });
    }
}

function updateUnit(){
    if (validateForm()){
        $('#btnSaveSettings').hide();
        $('#btnLoading').show();
        data = {
            Mode: 'update',
            UnitId: $('#txtId').val(),
            UnitName: $('#txtName').val(),
            UnitMetric: $('#txtMetric').val()
        };
        requestModification(data);
    }
    else {
        $("#settings input[type*='text']").change(function () {
            validateForm();
        });
    }
}

function deleteUnit(){
    data = {
        Mode: 'delete',
        UnitId: $('#txtId').val()
    };
    requestModification(data);
}

function requestModification(formData){
    var request = $.ajax({
        type: "POST",
        url: "modifyUnit.php",
        data: formData
    });

    request.done(function(msg){
        location.reload();
    });

    request.fail(function(jqXHR, status){
        console.log("Failed to update: " + status);
        alert("Failed to update!");
    })
}

function requestModification(formData) {
    $.ajax({
        type: "POST",
        url: "modifyUnit.php",
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
                            showErrorMessage(jqXHR.responseText.split(': ')[1]?.replace('!', ''));
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

    if ($('#txtName').val() == "") {
        result = false;
        addInvalidClass($('#txtName'));
    }
    else {
        clearValidation($('#txtName'));
    }

    if ($('#txtMetric').val() == "") {
        result = false;
        addInvalidClass($('#txtMetric'));
    }
    else {
        clearValidation($('#txtMetric'));
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
        if ($('#unitModalTitleAdd').attr('style').includes('display: none')) {
            $('#btnSaveSettings').show();
        }
        else {
            $('#btnAddSettings').show();
        }

    }, 1000);
}

// run init on window load
$(document).ready(function () {
    initUnitSettings();
});