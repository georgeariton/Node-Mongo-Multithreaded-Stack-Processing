const MongoHandler = require(__dirname + "/MongoHandler.js");
const StackHandler = require(__dirname + "/StackHandler.js");

/**
 * @class App
 *
 * @classdesc Main application class, this will handle MongoDB (mongoose in our case) and the Worker Farm
 */
class App
{
    /**
     * @param childScript
     * @param options
     * @param processHandledCallback
     */
    constructor(childScript, options = {}, processHandledCallback = function() {})
    {
        // Options
        let mongoConnection = options.mongoConnection || {};
        let mongoOptions = options.mongoOptions || {};
        let farmOptions = options.farmOptions || {};


        // Mongo model instance, this will hold all of the processes, running or otherwise
        this.mongoModel = null;

        // Callback function to be called when a process done
        this.processHandled = processHandledCallback;

        // The "setInterval" instance so it can be closed
        this.listenInterval = 0;

        // The polling interval for the DB
        this.listenIntervalTime = 1000;

        // Current call number, this can be used to clear the interval
        this.counter = 0;

        // StackHandler instance
        this.stackHandler = new StackHandler(farmOptions, childScript);

        // Mongo instance that calls the "callback" function after the model is instantiated
        this.mongoHandler = new MongoHandler(mongoConnection, mongoOptions, (model) => {
            this.mongoModel = model;

            // Begin polling of the DB
            this.listen();
        });
    }

    /**
     * @function listen
     * @desc Main polling function
     */
    listen()
    {
        // Begin interval that will poll the collection for new entries
        this.listenInterval = setInterval((e) => {

            // Find all of the "new" queued elements
            this.mongoModel.find({"status": "queued"}, this.handleQueuedDocs.bind(this));


        }, this.listenIntervalTime);
    }

    /**
     * @function handleQueuedDocs
     *
     * @desc Handle queued items in the collection
     *
     * @param err
     * @param docs
     */
    handleQueuedDocs(err, docs)
    {
        // Just ignore errors
        // @TODO: Better error handling
        if (err) return;

        // Handle each of the queued docs
        docs.forEach(async (doc) => {
            // Change status to processing so that we know which of the inputs we are handling
            doc.status = "processing";
            await doc.save();

            // Enqueue the process to the stack
            this.stackHandler.enqueueProcesses({
                counter: ++this.counter, // debug counter so we can see that the processes are actually working
                doc: doc.toObject() // send the doc as a "JSON" string to the child script
            }, (err, data) => {
                // Handle the output of the child script
                this.childOutput(err, data)
            });
        });
    }

    /**
     * @function childOutput
     *
     * @desc Handle the callback sent to the child script
     *
     * @param err
     * @param data
     * @returns {boolean}
     */
    childOutput(err, data)
    {
        // Update the input so we know when everything is done
        this.mongoModel.findByIdAndUpdate(data.processor.doc._id, {"status": "done"}, {}, () => {
            // Call the callback with the correct parameters
            this.processHandled(err, data);
        });
    }
}

module.exports = App;