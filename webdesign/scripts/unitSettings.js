
function initUnitSettings() {
    $('#sensorTable tr').click(function () {
        handleRowClick(this);
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
    data = {
        Mode: 'add',
        UnitName: $('#txtName').val(),
        UnitMetric: $('#txtMetric').val()
    };
    requestModification(data);
}

function updateUnit(){
    data = {
        Mode: 'update',
        UnitId: $('#txtId').val(),
        UnitName: $('#txtName').val(),
        UnitMetric: $('#txtMetric').val()
    };
    requestModification(data);
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




window.onload = initUnitSettings;