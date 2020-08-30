const {connection: mongoConnection, options: mongoOptions} = require(__dirname + "/../../src/config/mongo.json");
const mongoose = require('mongoose');
const upsertMany = require('@meanie/mongoose-upsert-many');
const {argv} = require('yargs')
    .option("w", {
        alias: "websites",
        describe: "The websites that will be added to the stack",
        demandOption: "You must enter at least one website",
        type: "array"
    });

/**
 * @class MongoHandler
 *
 * @classdesc This will handle the communication with MongoDB through mongoose
 */
class MongoHandler
{
    /**
     * @param {Object} connection
     * @param {Object} options
     * @param (callback) callback
     */
    constructor(connection, options, callback)
    {
        mongoose.connect(connection.serverIp + connection.dbName, options);

        this.db = mongoose.connection;
        this.db.on("error", this.handleError);
        this.db.once("open", callback);
    }

    handleError()
    {
        console.log("Connection Error");
    }


}

/**
 * @class Analysis
 *
 * @classdesc This is used to basically add the websites to the database with the queued status and be processed
 */
class Analysis
{
    /**
     * @param websites
     */
    constructor(websites = [])
    {
        // Save the websites within this instance for later use
        this.websites = websites;

        new MongoHandler(mongoConnection, mongoOptions, this.afterMongoConnect.bind(this));
    }

    /**
     * @function afterMongoConnect
     *
     * @desc Adds processes to the stack and handles output
     */
    afterMongoConnect()
    {
        /**
         * @type {Mongoose.Schema}
         */
        let processStackSchema = new mongoose.Schema({
            "input": Object,
            "status": {
                "type": String,
                "default": "queued"
            }
        }, {
            "strict": false,
            upsertMany: {
                matchFields: ['input.website'],
                type: 'replaceOne',
                ensureModel: true,
            }
        });

        // Use the upsert plugin so we can update or insert many docs at once
        processStackSchema.plugin(upsertMany);

        /**
         * Instantiate processStack model
         * @type {Model}
         */
        this.processStackModel = mongoose.model ("ProcessStack", processStackSchema);

        // If the same website is already processing, we need to let it do its thing
        this.processStackModel.find()
            .where("input.website").in(this.websites)
            .where("status").equals("processing")
            .then((docs) => {

                // All of the processing websites will be stored here
                let processingWebsites = [];
                docs.forEach((item) => {
                    processingWebsites.push(item.input.website);
                });

                // All of the docs that will be updated
                let inputs = [];
                this.websites.forEach((website) => {
                    // Ignore all of the processing websites and create the new entries in the stack
                    if (!processingWebsites || processingWebsites.indexOf(website) === -1) {
                        let entry = new this.processStackModel;
                        entry.input = {
                            "website": website
                        };
                        entry.status = "queued";
                        inputs.push(entry);
                    }
                });

                // Upsert all of the entries
                this.processStackModel.upsertMany(inputs).then(() => {
                    // Begin polling of the database so we can know when everything is done
                    this.poll();
                });
            });
    }

    /**
     * @function poll
     *
     * @desc Poll the database for the websites that are done so we can find out if everything went as planned
     * @TODO: handle failed websites
     */
    poll()
    {

        this.processStackModel.find()
            .where("input.website").in(this.websites)
            .where("status").equals("done")
            .then((docs) => {
                if (docs.length !== this.websites.length) {
                    setTimeout(this.poll.bind(this), 500);
                } else {
                    this.finish();
                }
            });
    }

    /**
     * Currently we just print "done", and the output should be read independently through the DB
     */
    finish()
    {
        console.log({status: "done"});

        // Close the process so we don't have anything left hanging
        process.exit();
    }
}

// Instantiate the class using the sent arguments
new Analysis(argv.websites);