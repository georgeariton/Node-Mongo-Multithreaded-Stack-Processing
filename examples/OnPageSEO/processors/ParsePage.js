const {default: fetch, Headers} = require("node-fetch");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const fs = require('fs');

/**
 * @class ParsePage
 *
 * @classdesc Simple page parser used to determine some basic seo functionality
 */
class ParsePage
{
    /**
     *
     * @param {Object} data
     * @param {callback} callback
     */
    constructor(data, callback)
    {
        this.data = data;
        this.input = data.doc.input;
        this.callback = callback;

        this.url = this.input.website;

        /**
         * @desc Set the language for the fetch functionality
         *
         * @type {fetch.Headers}
         */
        this.headers = new Headers({
            "Accept-Language": "en-US"
        });


        this.getData();
    }

    /**
     * @function getData
     *
     * @desc Fetch the data from the website so we can begin the parsing functionality
     */
    getData()
    {
        // Get the data from the URL using the headers set in the constructor
        fetch(this.url, {headers: this.headers})
            .then((response) => {
                // Read the as text from the response
                response.text()
                    .then((data) => {
                        // Send data to be parsed by jsdom
                        this.parseResponse(data);
                    })
                    .catch((e) => {
                        this.callback("error", {
                            processor: this.data,
                            output: {}
                        });
                    });
            })
            .catch((e) => {
                this.callback("error", {
                    processor: this.data,
                    output: {}
                });
            }
        );
    }

    /**
     * @function parseResponse
     *
     * @desc Parse the text response from the website
     *
     * @param data
     */
    parseResponse(data)
    {

        // Initialize the dom functionality so we can parse them as we would on the client side
        let dom = new JSDOM(data);

        // The "document" from the DOM, this contains all of the elements
        let document = dom.window.document;

        /**
         * @desc Instantiate the SEORules class so we can parse some of the properties
         * @type {SEORules}
         */
        let seoRules = new SEORules();

        // Self explanatory
        let h1 = document.querySelectorAll("h1");
        let h2 = document.querySelectorAll("h2");
        let allImages = document.querySelectorAll("img");
        let noAltImages = 0;

        // Debug functionality
        // let fName = this.url.replace(/[^a-z0-9]/gi,'');
        // fs.writeFile(`${fName}.txt`, document.querySelectorAll("h1") && document.querySelectorAll("h1").length, function (err) {
        //     if (err) return console.log(err);
        // });

        // Some arbitrary SEO RULES
        if (allImages) {
            allImages.forEach((item) => {
                !!item.getAttribute('alt') && noAltImages++;
            });
        }

        seoRules.h1(h1 ? h1.length : 0);
        seoRules.h2(h2 ? h2.length : 0);
        seoRules.images(allImages ? allImages.length : 0, noAltImages);

        this.callback(false, {
            processor: this.data,
            output: seoRules.messages
        });
    }
}

/**
 * @class SEORules
 *
 * @classdesc Sample SEO analysis class
 */
class SEORules
{
    constructor()
    {
        this.messages = [];
        this.context = "generic";
    }

    h1(length = 0)
    {
        this.context = "h1";

        switch (length) {
            case 1:
                this.addMessage("success", "Correct number of H1 Headings");
                break;
            case 0:
                this.addMessage("error", "There are no H1 Headings");
                break;
            default:
                this.addMessage("warning", "Too many H1s on the page");
        }
    }

    h2(length = 0)
    {
        this.context = "h2";

        switch (length) {
            case 1:
                this.addMessage("warning", "Only 1 h2 on the page");
                break;
            case 0:
                this.addMessage("warning", "There are no H2 Headings");
                break;
            default:
                this.addMessage("success", `There are ${length} H2s on the page`);
        }
    }

    images(allImages, noAltImages)
    {
        this.context = "images";
        switch(noAltImages) {
            case 0:
                this.addMessage("success", "There are no images that don't have the 'alt' attribute");
                break;
            case (allImages === noAltImages):
                this.addMessage("error", `All ${allImages} images are missing the 'alt' attribute`);
                break;
            default:
                this.addMessage("warning", `${noAltImages} out of ${allImages} images don't have an 'alt' attribute`);
        }
    }

    addMessage(type = "success", message = "")
    {
        this.messages.push({
            "type": type,
            "message": message,
            "context": this.context
        });
    }
}

module.exports = function(input, callback) {
    try {
        new ParsePage(input, callback);
    } catch (e) {
        callback(e, {
            processor: input,
            output: {}
        });
    }
};