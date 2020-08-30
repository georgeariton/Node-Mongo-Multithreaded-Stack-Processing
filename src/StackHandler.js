const workerFarm = require('worker-farm');

/**
 * @class StackHandler
 *
 * @classdesc StackHandler class that will handle all of the worker farm children
 */
class StackHandler
{
    /**
     * @param {Object} config This will be config for that will be merged with the default config
     * @param {Object} childScript The script that wil be execute on each thread
     */
    constructor(config = {}, childScript)
    {
        // Default config
        const defaults = {
            "workerOptions": {},
            "maxCallsPerWorker": Infinity,
            "maxConcurrentWorkers": 2,
            "maxConcurrentCallsPerWorker": 10,
            "maxConcurrentCalls": Infinity,
            "maxCallTime": Infinity,
            "maxRetries": Infinity,
            "autoStart": false,
            "onChild": function() {

            }
        };

        // Merge the default config with the config set when the class was instantiated
        let options = {...defaults, ...config};

        // -1 is code for Infinity
        for (let option in options) {
            if (options[option] === -1) {
                options[option] = Infinity;
            }
        }

        /**
         * @type {Farm.Workers|*}
         */
        this.workerFarm = workerFarm(options, childScript);
    }

    /**
     * @function enqueueProcesses
     *
     * @desc This will be used to add processes to the existing stack
     *
     * @param doc
     * @param callback
     */
    enqueueProcesses(doc, callback)
    {
        this.workerFarm(doc, callback);
    }
}

module.exports = StackHandler;