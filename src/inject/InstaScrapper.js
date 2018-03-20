/*
    Constants
*/
const JSON_POST_SUFFIX = "&__a=1";
const POST_LINK_BASE = "https://www.instagram.com/p/";
const ID_INDEX = 4;
const PROFILE_NAME_CSS_CLASS = "_rf3jb notranslate";
const LINK_DIV_CSS_CLASS = "_6d3hm _mnav9";
const INSTASCRAPPER_LINK_NAME = "instaScrapperLink";
const SELECTION_CHECK_NAME = "selectionCheck";
const CHECKMARK_LINK = "http://www.iconarchive.com/download/i103471/paomedia/small-n-flat/sign-check.ico";
const USE_CREDENTIALS = {credentials: "same-origin"};

/*
    This class is used for downloading and managing the selected media of the Instagram Profile.
*/
class InstagramMediaDownloader {

    constructor() {
        this.selectedList = {};
    }

    /**
     * Activates the media selection on the Instagram Profile page.
     */
    activate() {
        this.initExistingLinks();
        this.initLinksOnCreation();
    }

    /**
     * Unactivates the media selection on the Instagram Profile page.
     */
    unactivate() {
        let links = document.getElementsByName(INSTASCRAPPER_LINK_NAME);

        // Remove all the event listeners from the links
        for (let i = 0; i < links.length; i++)
            links[i].removeEventListener("click", (e) => this.switchSelection(a));

        // Remove all the checkmark images
        let checkImages = document.getElementsByName(SELECTION_CHECK_NAME);
        for (let i = 0; i < checkImages.length; i++)
            checkImages[i].remove();
    }

    /**
     * Returns a promise that will contain a list of links to the media of the given post.
     * @param {string} postLink The link to the post to get the media of.
     * @returns {Promise<string[]>} The resolved promive will contain list of media links from post.
     */
    getMediaLinksFromPost(postLink) {
        // Return a Promise that the function will return list of media links in post
        return fetch(postLink, USE_CREDENTIALS).then((response) => {
            return response.json().then((jsonObject) => {
                let imageLinks = [];
                let media = jsonObject.graphql.shortcode_media;
                let sidecars = media.edge_sidecar_to_children;

                // Save regularly if the post is a regular video/image post (not a sidecar)
                if (sidecars === undefined) {
                    if (media.is_video)
                        imageLinks.push(media.video_url);
                    else
                        imageLinks.push(media.display_resources.pop().src)
                } else {
                    // For each sidecar media, save the link as usual (like regular video/image)
                    for (let i = 0; i < sidecars.edges.length; i++) {
                        let edgeNode = sidecars.edges[i].node;
                        if (edgeNode.is_video)
                            imageLinks.push(edgeNode.video_url);
                        else {
                            let edgeResources = edgeNode.display_resources;
                            imageLinks.push(edgeResources.pop().src);
                        }
                    }
                }
                return imageLinks;
            }).catch((reason) =>console.log(`Error: ${reason}`));;
        }).catch((reason) =>console.log(`Error: ${reason}`));
    }


    /**
     * Inits all the <a> elements in the page that are related to posts.
     */
    initExistingLinks() {
        // Init every link that is a instagram post link
        [...document.getElementsByTagName("a")].forEach((p) => {
            if (p.href != undefined && p.href.startsWith(POST_LINK_BASE)) {
                this.initLink(p);
            }
        });
    }

    /**
     * Adds an event handler to the page, that gets triggered when a new DOM element is added.
     * When a new <a> element is added to the page, it will be initiated using @method initLink
     * @returns {void}
     */
    initLinksOnCreation() {
        // Add event listener that's triggered when a new DOM element is inserted.
        addEventListener("DOMNodeInserted", (e) => {
            // Save the element that was inserted
            let DOMElement = e.srcElement;

            // If the element that was inserted is a div that contains links to posts, initiate his links
            if (DOMElement.className == LINK_DIV_CSS_CLASS) {

                // For each div that contains a link
                for (let i = 0; i < DOMElement.children.length; i++) {
                    // Save the links that he contains
                    const aCollection = Array.from(DOMElement.children[i].children);

                    // Initiate every link in the link collection
                    aCollection.forEach(a => {
                        // Initiate the link
                        this.initLink(a);

                        // Select the link if it was already selected
                        if (this.selectedList[a.href] !== undefined)
                            this.reselect(a);
                    });
                }
            }
        });
    }


    /**
     * Returns a list of the selected posts.
     * @returns {HTMLLinkElement[]} List of <a> elements of the selected posts.
     */
    getSelectedPosts() {
        let posts = [];

        // Unselect every selected post, and add them to the list to return
        for (const post in this.selectedList) {
            const element = this.selectedList[post];
            posts.push(post);
            this.unSelect(element);
        }
        return posts;
    }

    /**
     * Returns a Promise that the function will return a list of links to the selected media.
     * @returns {Promise<string[]>} The resolved promise will contain a list of links to the selected media.
     */
    getSelectedMediaLinksAsync() {
        // Return a Promise that the function will return the media links
        return new Promise((resolve, reject) => {
            let mediaLinks = [];
            let doneCount = 0;
            let selectedPosts = this.getSelectedPosts();

            // For each selected post, save the post link
            for (let i = 0; i < selectedPosts.length; i++) {
                const postLink = selectedPosts[i];

                // Get all the media links of the post and save them in the list to return
                this.getMediaLinksFromPost(postLink + JSON_POST_SUFFIX).then((links) => {
                    // Add the links to the list
                    mediaLinks = mediaLinks.concat(links);
                    doneCount++;

                    // Check if we've finished the link gathering
                    if (i == selectedPosts.length - 1) {
                        let interval = setInterval(() => {
                            // If we're done, resolve the Promise
                            if (doneCount == selectedPosts.length) {
                                clearInterval(interval);
                                resolve(mediaLinks);
                            }
                        }, 100);
                    }
                }).catch((reason) =>console.log(`Error: ${reason}`));;
            }
        });
    }

    /**
     * Returns the profile name as a string
     * @returns {string} profile name
     */
    getProfileName() {
        return document.getElementsByClassName(PROFILE_NAME_CSS_CLASS)[0].title;
    }

    /**
     * Inits a given <a> element to be functional with this class.
     * @param {HTMLLinkElement} a The <a> element to init.
     */
    initLink(a) {
        a.name = INSTASCRAPPER_LINK_NAME;
        a.addEventListener("click", (e) => this.switchSelection(a));
    }

    /**
     * Selects a given <a> element.
     * @param {HTMLLinkElement} a The <a> element to select.
     */
    select(a) {
        // Save the link element in the selected links list
        this.selectedList[a.href] = a;

        // Set the checkmark image settings & style
        let img = new Image();
        img.src = CHECKMARK_LINK;
        img.style.zIndex = "10";
        img.style.position = "absolute";
        img.style.width = "-webkit-fill-available";
        img.name = SELECTION_CHECK_NAME;
        img.id = a.href.split('/')[ID_INDEX];

        // Insert the checkmark in front of the instagram image
        a.insertBefore(img, a.firstChild);
    }

    /**
     * Unselects a given <a> element.
     * @param {HTMLLinkElement} a The <a> element to unselect.
     */
    unSelect(a) {
        // Do nothing of the link is not selected at all
        if (this.selectedList[a.href] === undefined) return;

        // Save checkmark image element to remove by it's id
        let id = this.selectedList[a.href].href.split('/')[ID_INDEX];
        let imgElement = document.getElementById(id);

        // If the checkmark image is found, remove it
        if (imgElement != null && imgElement != undefined)
            imgElement.remove();

        // Remove the link from the selected links list
        delete this.selectedList[a.href];
    }

    /**
     * Toggles the selection of a given <a> element.
     * @param {HTMLLinkElement} a The <a> element to toggle the selection of.
     */
    switchSelection(a) {
        if (this.selectedList[a.href] === undefined)
            this.select(a);
        else
            this.unSelect(a);
    }

    /**
     * Reselects a given <a> element.
     * @param {HTMLLinkElement} a The <a> element to reselect.
     */
    reselect(a) {
        this.unSelect(a);
        this.select(a);
    }
}