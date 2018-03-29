/*
	This script runs on a specific tab in chrome.
	It communicates with the popup script of the extension. 
*/

const mediaDownloader = new InstagramMediaDownloader();
const qualityImprover = new InstaQualityImprover();
const storyDownloader = new InstaStoryDownloader();

chrome.extension.sendMessage({}, function (response) {
	var readyStateCheckInterval = setInterval(() => {
		if (document.readyState === "complete") {
			clearInterval(readyStateCheckInterval);

			// Apply the event handlers to the document
			qualityImprover.apply();
			storyDownloader.apply();
		}
	}, 10);
});

chrome.extension.onMessage.addListener((request, sender, sendResponse) => {
	// Create the response data object
	var responseData = {};
	responseData.section = "profile";
	responseData.status = (request.active) ? "OK" : "DATA";

	// If the user should select links, let him do it.
	if (request.active) {
		mediaDownloader.activate();
		sendResponse(responseData);
		console.log(responseData);
	} else {
		// Save the selected links and the profile name in the response and send it
		mediaDownloader.getSelectedMediaLinksAsync().then((selectedLinks) => {
			responseData.data = selectedLinks;
			responseData.profileName = mediaDownloader.getProfileName();
			chrome.extension.sendMessage(responseData, (res) => console.log("Background Recieved data."));

			sendResponse(responseData);
		});
	}
});