
var defLiveDataNum = 6;
//var defStartDateTime = moment(defEndDateTime - (24 * 3600 * 1000));
//var defEndDateTime = moment();
var defEndDateTime = moment("2020-08-23T16:55:05.970327");
var defStartDateTime = moment("2020-08-23T16:50:05.970327");
var timeRangeLiveMode = false;
var rollingAverage = false;
var interval;
var backlogDataRange = 0;

if (typeof (startDateTime) == 'undefined') {
    var startDateTime = defStartDateTime.format('YYYY-MM-DDTHH:mm:ss.SSS');
}

if (typeof (endDateTime) == 'undefined') {
    var endDateTime = defEndDateTime.format('YYYY-MM-DDTHH:mm:ss.SSS');
}

if (typeof (xAxisDataId) == 'undefined') {
    var xAxisDataId = "";
}

if (typeof (yAxisDataId) == 'undefined') {
    var yAxisDataId = "";
}

function initSettings() {
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
    $('#xAxisSelectPicker').on('changed.bs.select', function () {
        xAxisDataId = $('#xAxisSelectPicker').val();
    });

    $('#yAxisSelectPicker').on('changed.bs.select', function () {
        yAxisDataId = $('#yAxisSelectPicker').val();
    });

    $("#startDateTime").on("change.datetimepicker", function (e) {
        $('#endDateTime').datetimepicker('minDate', e.date);
        startDateTime = $('#startDateTime').datetimepicker('date').format('YYYY-MM-DDTHH:mm:ss.SSS');
    });

    $("#endDateTime").on("change.datetimepicker", function (e) {
        $('#startDateTime').datetimepicker('maxDate', e.date);
        endDateTime = $('#endDateTime').datetimepicker('date').format('YYYY-MM-DDTHH:mm:ss.SSS');
    });

    $('#dataTimingRange').parent().click(function () {
        $('#dataTimingRange').parent().removeClass("btn btn-secondary");
        $('#dataTimingLive').parent().removeClass("btn btn-primary active");
        $('#dataTimingLive').parent().addClass("btn btn-secondary");
        $('#dataTimingRange').parent().addClass("btn btn-primary active");
        $('#settingsTimingRange').show();
        $('#settingsTimingLive').hide();
        timeRangeLiveMode = false;
    });

    $('#dataTimingLive').parent().click(function () {
        $('#dataTimingLive').parent().removeClass("btn btn-secondary");
        $('#dataTimingRange').parent().removeClass("btn btn-primary active");
        $('#dataTimingRange').parent().addClass("btn btn-secondary");
        $('#dataTimingLive').parent().addClass("btn btn-primary active");
        $('#settingsTimingRange').hide();
        $('#settingsTimingLive').show();
        $('#settingsTimingRange').val("off");
        $('#settingsTimingLive').val("on");
        timeRangeLiveMode = true;
    });

    $('#rollingAverageOff').parent().click(function () {
        $('#rollingAverageOff').parent().removeClass("btn btn-secondary");
        $('#rollingAverageOn').parent().removeClass("btn btn-primary active");
        $('#rollingAverageOn').parent().addClass("btn btn-secondary");
        $('#rollingAverageOff').parent().addClass("btn btn-primary active");
        $('.rollingAverage').hide();
        rollingAverage = false;
    });

    $('#rollingAverageOn').parent().click(function () {
        $('#rollingAverageOn').parent().removeClass("btn btn-secondary");
        $('#rollingAverageOff').parent().removeClass("btn btn-primary active");
        $('#rollingAverageOff').parent().addClass("btn btn-secondary");
        $('#rollingAverageOn').parent().addClass("btn btn-primary active");
        $('.rollingAverage').show();
        rollingAverage = true;
    });

    $('#liveNum').change(function () {
        updateBacklogData();
    });

    $('#liveRange').change(function () {
        updateBacklogData();
    });

    $('#settingsModal').on('hidden.bs.modal', function (e) {
        controlUpdate();
    });

    //$('#btnSaveSettings').click(function () { controlUpdate(); });
}

function updateBacklogData() {
    var backlogVal = $('#liveNum').val();
    var backlogRange = $('#liveRange').val();
    backlogDataRange = backlogVal * backlogRange;
}

function controlUpdate() {
    if ($('#yAxisSelectPicker').val() != "" &&
        $('#startDateTime').datetimepicker('date').format('YYYY-MM-DDTHH:mm:ss.SSS') != "" &&
        $('#endDateTime').datetimepicker('date').format('YYYY-MM-DDTHH:mm:ss.SSS') != "") {

        if (timeRangeLiveMode) {
            interval = setInterval(updateGraph, 3000);
        }
        else {
            if (typeof interval !== 'undefined')
                clearInterval(interval);
            updateGraph();
        }
    }
    else {
        $('#chart svg').empty();
        $('#focus svg').empty();
    }
}

function updateBacklogData() {
    var backlogVal = $('#liveNum').val();
    var backlogRange = $('#liveRange').val();
    backlogDataRange = backlogVal * backlogRange;
}


// run init on window load
$(document).ready(function () {
    initSettings();
});
