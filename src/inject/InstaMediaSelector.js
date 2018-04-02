const ICONS_BAR_CLASS = "_qlijk";
const VIDEO_THUMBNAIL_CLASS = "_sajt6";
const SELECTOR_SIZE = 24;

class InstaMediaSelector {
    constructor() {
        this.selector = new Image(SELECTOR_SIZE, SELECTOR_SIZE);
        this.selector.src = chrome.extension.getURL('/images/download2.png');
    }

    apply() {
        // Add the selector img to the document
        let containingDiv = document.createElement("div");
        containingDiv.classList.add("_b28md");
        containingDiv.appendChild(this.selector);
        document.getElementsByClassName(ICONS_BAR_CLASS)[0].appendChild(containingDiv);

        // Add the event handler to the document
        addEventListener("dragend", (e) => {
            if (e.target !== this.selector) return;
            let medias = this.getMediaByLocation(e.clientX, e.clientY);
            this.downloadMedia(medias[0]);
        });
    }

    /**
     * Returns a list of media (img | video) element that collide with the given location.
     * @param {number} x The X value of the location.
     * @param {number} y The Y value of the location.
     * @returns {Array} list of media (img | video)
     */
    getMediaByLocation(x, y) {

        // Do nothing if the arguments are invalid
        if (typeof (x) !== "number" || typeof (x) !== "number") return;

        // Save all the existing images in array
        let imgs = Array.from(document.getElementsByTagName('img'));
        let videos = Array.from(document.getElementsByTagName('video'));
        let medias = imgs.concat(videos);
        let foundMedias = [];

        // Find the medias in the given location (if there's any at all)
        for (const media of medias) {

            // Skip this media if it is a video thumbnail (because we want to download the actual video)
            if (media.classList.contains(VIDEO_THUMBNAIL_CLASS)) continue;

            // Save all the media location information
            let mediaRect = media.getBoundingClientRect();
            let mediaX = mediaRect.x;
            let mediaY = mediaRect.y;
            let mediaW = media.width;
            let mediaH = media.height;

            // Try to gather the information again If it is invalid (null | undefined | 0) 
            if (!mediaX || !mediaY || !mediaW || !mediaH) {
                mediaX = mediaRect.x;
                mediaY = mediaRect.y;
                mediaW = media.clientWidth;
                mediaH = media.clientHeight;
            }

            // If the current media is in the given location, save the media to the list.
            if ((x >= mediaX && x <= (mediaX + mediaW)) && (y >= mediaY && y <= (mediaY + mediaH)))
                foundMedias.push(media);
        }

        // Return all the medias in the given location
        return foundMedias;
    }

    /**
     * Sends a request to the background script to download the content of the given media.
     * @param {HTMLVideoElement | HTMLImageElement} media Media Element to download the content of.
     */
    downloadMedia(media) {
        if (!media) return;
        let downloadUrl = media.src;
        let randomFileName = Math.random().toString(36).substring(2);
        let format = downloadUrl.split(".").reverse()[0];
        let downloadData = {};
        downloadData.section = "selector";
        downloadData.url = downloadUrl;
        downloadData.filename = `${randomFileName}.${format}`;
        chrome.extension.sendMessage(downloadData, (res) => console.log("Background recieved download data."));
    }
}