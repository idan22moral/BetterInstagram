/*
    This script is the popup script of the extension.
    It runs on the little window that the user can use to activate and download the selected data.
*/

let activationStatus = false;
const ACTIVATE = "Activate";
const UNACTIVATE = "Download";

chrome.storage.sync.get("activated", (status) => {
    // Load the activation status from the storage // || !status.hasOwnProperty("activated")
    activationStatus = (status.activated === undefined) ? false : status.activated;

    // Initialize the activation button
    let activateButton = document.createElement("button");
    activateButton.id = "activateButton";
    activateButton.innerHTML = (activationStatus) ? UNACTIVATE : ACTIVATE;
    activateButton.addEventListener("click", (e) => toggleActivation(e.target || e.srcElement));
    document.getElementById("centerDiv").appendChild(activateButton);
});

/**
 * @param {HTMLButtonElement} button triggered event information
 * */
function toggleActivation(button) {
    // Switch the content of the button
    activationStatus = !activationStatus;
    button.innerHTML = (activationStatus) ? UNACTIVATE : ACTIVATE;

    // Save the activation status in the storage for later 
    chrome.storage.sync.set({
        "activated": activationStatus
    });

    // Get the current active tab of the user
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, (tabs) => {
        // Send the activation status to the current active tab of the user
        chrome.tabs.sendMessage(tabs[0].id, {
            active: activationStatus
        }, (response) => {
            // Get the response from the tab (the selected media or selection start confirmation)
        });
    });
}