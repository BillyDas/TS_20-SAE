
var defLiveDataNum = 6;
//var defStartDateTime = moment(defEndDateTime - (24 * 3600 * 1000));
//var defEndDateTime = moment();
var defEndDateTime = moment("2020-08-23T16:55:05.970327")
var defStartDateTime = moment("2020-08-23T16:50:05.970327");

function initSettings(){
    //apply default values on load
    $('#liveNum').val(defLiveDataNum);
    $('#liveRange').val(3600000);
    $('#settingsTimingLive').hide();

    $('#endDateTime').datetimepicker('date', defEndDateTime);
	$('#startDateTime').datetimepicker('date', defStartDateTime);
    
    //Set options on bootstrap items
    $('#startDateTime').datetimepicker({
        format: "DD/MM/YYYY hh:mmA"
    });

    $('#endDateTime').datetimepicker({
        useCurrent: false,
        format: "DD/MM/YYYY hh:mmA"
    });

    //Setup Event Listeners
    $("#startDateTime").on("change.datetimepicker", function (e) {
        $('#endDateTime').datetimepicker('minDate', e.date);
    });

    $("#endDateTime").on("change.datetimepicker", function (e) {
        $('#startDateTime').datetimepicker('maxDate', e.date);
    });

    $('#dataTimingRange').parent().click(function () {
        $('#dataTimingRange').parent().removeClass("btn btn-secondary");
        $('#dataTimingLive').parent().removeClass("btn btn-primary active");
        $('#dataTimingLive').parent().addClass("btn btn-secondary");
        $('#dataTimingRange').parent().addClass("btn btn-primary active");
        $('#settingsTimingRange').show();
        $('#settingsTimingLive').hide();
    });

    $('#dataTimingLive').parent().click(function () {
        $('#dataTimingLive').parent().removeClass("btn btn-secondary");
        $('#dataTimingRange').parent().removeClass("btn btn-primary active");
        $('#dataTimingRange').parent().addClass("btn btn-secondary");
        $('#dataTimingLive').parent().addClass("btn btn-primary active");
        $('#settingsTimingRange').hide();
        $('#settingsTimingLive').show();
    });
    
	$('#settingsModal').on('hidden.bs.modal', function (e) {
		controlUpdate();
    });
    
	//$('#btnSaveSettings').click(function () { controlUpdate(); });
}

function controlUpdate() {
	if ($('#yAxisSelectPicker').val() != "" &&
		$('#startDateTime').datetimepicker('date').format('YYYY-MM-DDTHH:mm:ss.SSS') != "" &&
		$('#endDateTime').datetimepicker('date').format('YYYY-MM-DDTHH:mm:ss.SSS') != "") {
		updateGraph();
	}
	else {
		$('#chart svg').empty();
		$('#focus svg').empty();
	}
}

// run init on window load
$(document).ready(function () {
	initSettings();
});