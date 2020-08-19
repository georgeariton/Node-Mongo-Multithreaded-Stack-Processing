const {connection: mongoConnection, options: mongoOptions} = require(__dirname + "/config/mongo.json");
const {farm: farmOptions} = require(__dirname + "/config/worker-farm.json");
const MongoHandler = require(__dirname + "/MongoHandler.js");
const StackHandler = require(__dirname + "/StackHandler.js");

/**
 * Main application
 */
class App
{
    constructor(childScript, processHandled)
    {
        // Mongo model instance, this will hold all of the processes, running or otherwise
        this.mongoModel = null;

        // Callback function to be called when a process done
        this.processHandled = processHandled;

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
     * Main polling function
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
     * Handle queued items in the collection
     *
     * @param err
     * @param docs
     */
    handleQueuedDocs(err, docs)
    {
        if (err) return;

        docs.forEach((doc) => {
            this.stackHandler.enqueueProcesses({
                counter: ++this.counter,
                doc: doc.toObject()
            }, this.childOutput.bind(this));
        });
    }

    /**
     * Handle the callback sent to the child script
     *
     * @param data
     * @returns {boolean}
     */
    childOutput(data)
    {
        this.mongoModel.findByIdAndUpdate(data.doc._id, {"status": "done"}, {}, () => {
            this.processHandled(data);
        });
    }
}

module.exports = App;