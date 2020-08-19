const mongoose = require('mongoose');

/**
 * This will handle the communication with MongoDB through mongoose
 */
class MongoHandler
{
    constructor(connection, options, callback)
    {
        this.callback = callback;

        mongoose.connect(connection.serverIp + connection.dbName, options);

        this.db = mongoose.connection;
        this.db.on("error", this.handleError);
        this.db.once("open", this.handleConnectionOpen.bind(this));
    }

    handleError()
    {
        console.log("Connection Error");
    }

    handleConnectionOpen()
    {
        this.processStackSchema = new mongoose.Schema({
            "input": Object,
            "status": String
        }, {
            "strict": false
        });

        this.processStackModel = mongoose.model("ProcessStack", this.processStackSchema);

        this.callback(this.processStackModel);
    }

    disconnect()
    {
        mongoose.disconnect();
    }
}

module.exports = MongoHandler;