var hostUrl = window.location.origin;
if (hostUrl == null){
	hostUrl = "http://ts20.billydasdev.com";
}

function loadData() {
    // list of sensors available
    var sensorIds = [
        "0x2",
        "0x3",
        "0x4",
        "0x7",
        "0x8",
        "0x9",
        "0x10",
        "0x11",
        "0x12",
        "0xe",
        "0xf"
    ];

    // format strings for use in GET request
    for (var i = 0; i < sensorIds.length; i ++)
    {
        sensorIds[i] = '"' + sensorIds[i] + '"';
    }

    var startTime = "2020-08-23T16:51:05.970327Z";
    var endTime = "2020-08-23T16:55:28.525013Z";

    var url = hostUrl + ":3000/data?canId=[" 
    + sensorIds.toString() 
    + "]&startTime='" + startTime 
    + "'&endTime='" + endTime + "'"
    + "&max=20000";
	fetch(url)
		.then(response => response.json())
		.then(data => console.log(data));
}

// starts to load data before window loads
// loadData();
