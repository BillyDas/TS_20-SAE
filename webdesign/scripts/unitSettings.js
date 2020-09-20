
function initUnitSettings() {
    $('#sensorTable tr').click(function () {
        handleRowClick(this);
    });

    $('#addButton').click(function(){
        handleButtonClick();
    });
}

function handleButtonClick(){
    $('#unitModalTitle').innerHTML = '<i class="fa fa-plus"></i> Add Unit';
    $('#txtId').val('');
    $('#txtName').val('');
    $('#txtMetric').val('');
    $('#unitSettings').modal('show');
}

function handleRowClick(row){
    var data = [];
    for(var i = 0; i < row.children.length; i++){
        data.push(row.children[i].innerHTML);
    }
    $('#unitModalTitle').innerHTML = '<i class="fa fa-pencil"></i> Update Unit';
    $('#txtId').val(data[0]);
    $('#txtName').val(data[1]);
    $('#txtMetric').val(data[2]);
    $('#unitSettings').modal('show');
}




window.onload = initUnitSettings;