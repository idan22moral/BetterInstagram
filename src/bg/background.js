/*
	This script runs on the background of the extension.
	It manages the download system and creates ZIP files for the user.
*/

chrome.extension.onMessage.addListener((request, sender, sendResponse) => {
	chrome.pageAction.show(sender.tab.id);
	console.log(request);
	if(!request || !request.section) return;
	
	if(request.section == "profile"){
		
		// Do nothing if the message is not a data to download
		if (request.data === undefined) return;

		// Create a ZIP File
		let zipName = request.profileName || "images";
		let mediaData = [];
		let zip = new JSZip();

		// Download the data for each media in the data list
		for (let i = 0; i < request.data.length; i++) {
			const link = request.data[i];
			downloadMedia(link, mediaData);
			console.log(`Downloading ${i}`);
		}

		// Create The ZIP File and let the user download it to the local storage
		let downloadInterval = setInterval(() => {
			if (mediaData.length == request.data.length) {
				createArchive(mediaData, zipName);
				clearInterval(downloadInterval);
			}
		}, 100);
	}
	else if(request.section == "story" || request.section == "selector") {
		if(!request.url || !request.filename) return;

		chrome.downloads.download({
			url: request.url,
			filename: request.filename
		});
	}

	sendResponse();
});

/**
 * Loads the data of the Image / Video in the URL as Base64 | ArrayBuffer
 * @param {string} link The URL to the media
 * @param {Array} dataList The list to add to
 */
function downloadMedia(link, dataList) {
	let imgBlob = null;
	let reader = new FileReader();

	// Fetch the data from the image link and save the image as blob
	return fetch(link).then((response) => {
		return response.blob().then((blob) => {
			imgBlob = blob;

			// If the media is video, save as array buffer
			if (link.endsWith("mp4")) {
				reader.readAsArrayBuffer(imgBlob);
				reader.addEventListener("loadend", () => {
					dataList.push(reader.result);
				});
			} else {
				// Save the image as Base64 string
				reader.readAsDataURL(imgBlob);
				reader.addEventListener("loadend", () => {
					let res = reader.result.substring(23);
					dataList.push(res);
				});
			}
		});
	});
}

/**
 * Creates a ZIP file of all the files in dataList.
 * @param {Array} dataList  The list of base64 or ArrayBuffer data
 * @param {string} zipName The name of the ZIP file
 */
function createArchive(dataList, zipName) {
	// Use jszip
	let zip = new JSZip();

	let videoSettings = {
		arraybuffer: true
	};
	let imageSettings = {
		base64: true
	};
	let zipSettings = {
		type: "blob"
	};

	// Save every file in the ZIP file by its type (Image/Video)
	for (var i = 0; i < dataList.length; i++) {
		let isBuffer = (dataList[i].byteLength !== undefined);
		let fileFormat = (isBuffer) ? "mp4" : "jpg";
		let fileSettings = (isBuffer) ? videoSettings : imageSettings;
		zip.file(`${i}.${fileFormat}`, dataList[i], fileSettings);
	}

	// Generate a ZIP file and let the user save it to the local storage
	zip.generateAsync(zipSettings).then(file => {
		console.log("File Zipped! Saving file...");
		saveAs(file, `${zipName}.zip`);
	});
}