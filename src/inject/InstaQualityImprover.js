/*
    Contants
*/
const INSTAGRAM_MEDIA_CLASS = "_2di5p";
const INSTAGRAM_IMAGE_PARENT_CLASS = "_4rbun";
const INSTAGRAM_IMAGE_GRANDP_CLASS = "_e3il2 _pmuf1";

class InstaQualityImprover {
    constructor() {
        //
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

        // Change the source of the image to the best quality
        imgElement.src = bestQuailtyImageLink;
    }

    /**
     * Improve the selected media.
     */
    improveSelectedMediaQuality()
    {
        for (const media of this.getMediaImageElements()) {
            improveImageQuality(media);
        }
    }
}