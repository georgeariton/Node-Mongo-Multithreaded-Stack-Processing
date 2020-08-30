const mongoose = require('mongoose');

/**
 * @class MongoHandler
 *
 * @classdesc This will handle the communication with MongoDB through mongoose
 */
class MongoHandler
{
    /**
     * @param connection - connection and DB parameters
     * @param options - database options
     * @param callback - function to execute when everything is done
     */
    constructor(connection, options, callback)
    {
        this.callback = callback;

        mongoose.connect(connection.serverIp + connection.dbName, options);

        this.db = mongoose.connection;
        this.db.on("error", this.handleError);
        this.db.once("open", this.handleConnectionOpen.bind(this));
    }

    /**
     * @function handleError
     *
     * @desc Handle db errors
     * @TODO: rewrite for better logging
     */
    handleError()
    {
        console.log("Connection Error");
    }

    /**
     * @function handleConnectionOpen
     *
     * @desc When the connection is open we can begin inserting our data
     */
    handleConnectionOpen()
    {
        /**
         * @type {Mongoose.Schema}
         */
        this.processStackSchema = new mongoose.Schema({
            "input": Object,
            "status": String
        }, {
            "strict": false
        });

        /**
         * @type {Model}
         */
        this.processStackModel = mongoose.model("ProcessStack", this.processStackSchema);

        // Do callback
        this.callback(this.processStackModel);
    }

    /**
     * @function disconnect
     *
     * @desc Disconnecting is discouraged
     */
    disconnect()
    {
        mongoose.disconnect();
    }
}

module.exports = MongoHandler;