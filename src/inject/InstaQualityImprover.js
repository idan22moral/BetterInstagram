/*
    Contants
*/
const INSTAGRAM_MEDIA_CLASS = "_2di5p";
const INSTAGRAM_IMAGE_PARENT_CLASS = "_4rbun";
const INSTAGRAM_IMAGE_GRANDP_CLASS = "_e3il2 _pmuf1";
const INSTAGRAM_API_URL_BASE = 'https://i.instagram.com/api/v1/users/';
const PROFILE_PICTURE_CLASS = '_6q-tv';
const USERNAME_TITLE_CLASS = 'AC5d8 notranslate';

class InstaQualityImprover {
    constructor() {
        //
    }

    /**
     * Applies an event handler to the document, that gets triggered when a valid media DOM Element is being inserted.
     */
    apply() {
        // Improve the profile picture
        this.improveProfilePicture();

        // Improve the future-added pictures
        addEventListener("DOMNodeInserted", (e) => {
            this.improveSelectedMediaQuality();
        });
    }

    /**
     * Returns a List of image elements that contain instagram media.
     * @returns {Array<HTMLImageElement>} The List of image elements that contain instagram media.
     */
    getMediaImageElements() {
        return Array.from(document.getElementsByClassName(INSTAGRAM_MEDIA_CLASS)).filter(element => {
            let validParent = element.parentElement.classList.contains(INSTAGRAM_IMAGE_PARENT_CLASS);
            let validGrandParent = element.parentElement.parentElement.className == INSTAGRAM_IMAGE_GRANDP_CLASS;
            return validParent && validGrandParent;
        });
    }

    /**
     * Changes the src of a given HTML <img> element to be the maximum resolution.
     * @param {HTMLImageElement} imgElement The <img> element to improve the quality of.
     */
    improveImageQuality(imgElement) {
        // Do nothing of there's no better qualities
        if (imgElement.srcset === undefined || imgElement.srcset === null || imgElement.srcset.length == 0) return;

        // Save the best quality
        let bestQuailtyImageLink = imgElement.srcset.split(",").reverse()[0].split(" ")[0];

        // Change the source of the image to the best quality if necessary
        if (bestQuailtyImageLink !== imgElement.src)
            imgElement.src = bestQuailtyImageLink;
    }

    /**
     * Improve the selected media.
     */
    improveSelectedMediaQuality() {
        for (const media of this.getMediaImageElements()) {
            this.improveImageQuality(media);
        }
    }

    /**
     * Improves the quality of the profile picture
     */
    improveProfilePicture() {
        var profileId = this.getId().then(profileId => {
            fetch(`${INSTAGRAM_API_URL_BASE}${profileId}/info/`).then(res => {
                res.json().then(jsonObject => {
                    var hdUrl = jsonObject['user']['hd_profile_pic_url_info']['url'];
                    document.getElementsByClassName(PROFILE_PICTURE_CLASS)[0].src = hdUrl;
                    console.log("profile picture improved!");
                });
            });
        })

    }

    /**
     * Gets the user id of by the username in the profile
     */
    getId() {
        var username = document.getElementsByClassName(USERNAME_TITLE_CLASS)[0].innerText;
        return fetch(`https://www.instagram.com/${username}/?__a=1`).then(res => {
            return res.json().then(jsonObject => {
                return jsonObject["graphql"]["user"]["id"];
            });
        });
    }
}