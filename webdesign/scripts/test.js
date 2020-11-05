var hostUrl = window.location.origin;
if (hostUrl == null){
	hostUrl = "http://ts20.billydasdev.com";
}

function init() {
    console.log("connecting to server...");
	const url = hostUrl + ":3000/datavis?max=1";
	fetch(url)
		.then(response => response.json())
		.then(data => console.log(data));
}

window.onload = init;
