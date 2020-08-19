class Child
{
    constructor(input, callback)
    {
        this.input = input;
        this.callback = callback;


        this.callback(this.input);
    }
}

module.exports = function(input, callback) {
    try {
        new Child(input, callback);
    } catch (e) {
        callback(e, input);
    }
};