function loadData( response ) {
	alert(response);
}

function httpGetAsync(theUrl, callback) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", theUrl, true); // true for asynchronous 
    xmlHttp.send(null);
}

function init() {
	const url = "http://ts20.billydasdev.com:3000/datavis?max=1";
	fetch(url)
		.then(response => response.json())
		.then(data => console.log(data));
	//httpGetAsync(url, loadData);
}

window.onload = init;
