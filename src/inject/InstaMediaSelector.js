const ICONS_BAR_CLASS = '_47KiJ';
const VIDEO_THUMBNAIL_CLASS = '_sajt6';
const SELECTOR_SIZE = 24;
const VIDEO_ELEMENT_CLASS = 'tWeCl';
const VIDEO_SCRIPT_CLASS = 'QvAa1';
const POST_BUTTONS_CONTAINER_CLASS = 'ltpMr Slqrh';
const MAIN_BUTTONS_CONTAINER_CLASS = 'XrOey';
const IMAGE_POST_CLASS = 'eLAPa';

class InstaMediaSelector {
    constructor() {
        this.selector = new Image(SELECTOR_SIZE, SELECTOR_SIZE);
        this.selector.src = chrome.extension.getURL('/images/download2.png');
    }

    apply() {
        // Attach the selector to the existing posts
        /*for (const existingPost of document.getElementsByClassName(IMAGE_POST_CLASS))
            if (existingPost.classList && existingPost.classList.contains(IMAGE_POST_CLASS) && existingPost.classList.length > 1)
                this.attachSelectorToPost(existingPost);*/

        // Attach the selector to the upcoming posts
        addEventListener('DOMNodeInserted', (e) => {
            if(location.href == "https://www.instagram.com/") return;
            if (e.srcElement.className == 'downloadButtonBlack') return;

            var posts = Array.from(document.getElementsByClassName(IMAGE_POST_CLASS));
            var activePosts = posts.filter(p => p.classList.length > 1 && p.getBoundingClientRect().x > 0);

            if (activePosts.length > 0 && document.getElementsByClassName('downloadImg').length == 0) {
                activePosts.forEach(activePost => {
                    if (!activePost) return;
                    activePost.lastChild.addEventListener('click', (e) => {
                        if(location.href == "https://www.instagram.com/") return;
                        if (activePost.firstChild.firstChild.downloaded == true) return;
                        console.log('clicked!');
                        activePost.firstChild.firstChild.downloaded = true;
                        var link = activePost.firstChild.firstChild.src;
                        var filename = Math.random().toString(36).substring(2); // random name
                        var format = link.split('.').reverse()[0].split('?')[0];
                        this.downloadSingle(link, filename, format);
                    });
                });
            } else if (document.getElementsByClassName(VIDEO_SCRIPT_CLASS).length == 1) {
                console.log('video found!');
                var downloadButton = document.createElement('a');
                downloadButton.classList.add('downloadButtonBlack');
                downloadButton.addEventListener('click', (e) => {
                    if(location.href == "https://www.instagram.com/") return;
                    var link = document.getElementsByClassName(VIDEO_ELEMENT_CLASS)[0].src;
                    var filename = Math.random().toString(36).substring(2); // random name
                    var format = link.split('.').reverse()[0].split('?')[0];
                    this.downloadSingle(link, filename, format);
                });
                document.getElementsByClassName(POST_BUTTONS_CONTAINER_CLASS)[0].appendChild(downloadButton);
            }
        });

        // Add the selector img to the document
        let containingDiv = document.createElement('div');
        containingDiv.classList.add(MAIN_BUTTONS_CONTAINER_CLASS);
        containingDiv.appendChild(this.selector);
        document.getElementsByClassName(ICONS_BAR_CLASS)[0].appendChild(containingDiv);

        // Add the event handler to the document
        addEventListener('dragend', (e) => {
            if (e.target !== this.selector) return;
            let medias = this.getMediaByLocation(e.clientX, e.clientY);
            this.downloadMedia(medias[0]);
        });
    }

    attachSelectorToPost(postElement) {
        var downloadImg = document.createElement('img');
        downloadImg.classList.add('downloadImg');
        downloadImg.onclick += (element, e) => {
            console.log('clicked!');
            var link = postElement.firstChild.src;
            var filename = Math.random().toString(36).substring(2); // random name
            var format = link.split('.').reverse()[0].split('?')[0];
            this.downloadSingle(link, filename, format);
        };
        postElement.appendChild(downloadImg);
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

    downloadSingle(link, filename, format) {
        let downloadData = {};
        downloadData.section = 'single';
        downloadData.url = link;
        downloadData.filename = `${filename}.${format}`;
        chrome.extension.sendMessage(downloadData, (res) => console.log('Background recieved download data.'));
    }

    /**
     * Sends a request to the background script to download the content of the given media.
     * @param {HTMLVideoElement | HTMLImageElement} media Media Element to download the content of.
     */
    downloadMedia(media) {
        if (!media) return;
        let downloadUrl = media.src;
        let randomFileName = Math.random().toString(36).substring(2);
        let format = downloadUrl.split(".").reverse()[0].split('?')[0];
        this.downloadSingle(downloadUrl, randomFileName, format);
    }
}