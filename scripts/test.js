function init() {
    console.log("connecting to server...");
	const url = "http://ts20.billydasdev.com:3000/datavis?max=1";
	fetch(url)
		.then(response => response.json())
		.then(data => console.log(data));
}

window.onload = init;
