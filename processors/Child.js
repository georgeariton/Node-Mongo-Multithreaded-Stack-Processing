/**
 * @class Child
 *
 * @classdesc Example child script that will run when insert something with the status queued in the collection
 */
class Child
{
    /**
     * @param input - The input sent in App.js
     * @param callback - The callback that will be executed in App.js and passed to wherever you use that class
     */
    constructor(input, callback)
    {
        this.input = input;
        this.callback = callback;

        // Standard output for this is: {processor: this.input, output: {}|[]|null}
        this.callback(false, {
            processor: this.input,
            output: {}
        });
    }
}

module.exports = function(input, callback) {
    try {
        new Child(input, callback);
    } catch (e) {
        callback(e, {
            processor: input,
            output: {}
        });
    }
};